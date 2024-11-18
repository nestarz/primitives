import { walk } from '@std/fs/walk';
import { dirname } from '@std/path/dirname';
import { relative } from '@std/path/relative';
import { isAbsolute } from '@std/path/is-absolute';
import { parse } from '@swc/core';
import type { ImportDeclaration, Module } from '@swc/core';

interface PackageJson {
  name: string;
  source?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface PackageContext {
  packagePath: string;
  packageJson: PackageJson;
  sourcePath?: string;
  imports: Set<string>;
}

interface ResultOutput {
  [packagePath: string]: {
    packageName: string;
    specifierImports: string[];
  };
}

function isPackageSpecifier(importPath: string): boolean {
  return !importPath.startsWith('.') && !isAbsolute(importPath);
}

async function extractSpecifierImports(content: string): Promise<string[]> {
  try {
    const ast = await parse(content, {
      syntax: 'typescript',
      tsx: true,
      target: 'es2022',
    });

    const imports = new Set<string>();

    function visitNode(node: Module) {
      node.body.forEach((statement) => {
        if (statement.type === 'ImportDeclaration') {
          const importDecl = statement as ImportDeclaration;
          const source = importDecl.source.value;
          if (isPackageSpecifier(source)) {
            // Extract the root package name from the import
            const packageName = source;
            imports.add(packageName);
          }
        }
      });
    }

    visitNode(ast);
    return Array.from(imports);
  } catch (error) {
    console.warn('Parse error:', error.message);
    return [];
  }
}

async function scanImports(rootDir: string): Promise<ResultOutput> {
  const contexts: Map<string, PackageContext> = new Map();
  const result: ResultOutput = {};

  // First pass: collect all package.json contexts
  for await (const entry of walk(rootDir, {
    includeDirs: false,
    match: [/package\.json$/],
    skip: [/node_modules/, /\.d\.ts$/, /ssr-testing/],
  })) {
    try {
      const content = await Deno.readTextFile(entry.path);
      const packageJson = JSON.parse(content) as PackageJson;
      const packagePath = dirname(entry.path);

      if (packagePath !== '.')
        contexts.set(packagePath, {
          packagePath,
          packageJson,
          sourcePath: packageJson.source ? `${packagePath}/${packageJson.source}` : undefined,
          imports: new Set<string>(),
        });
    } catch (error) {
      console.warn(`Error processing ${entry.path}:`, error.message);
    }
  }

  // Process files in parallel
  const fileProcessingPromises: Promise<void>[] = [];

  for await (const entry of walk(rootDir, {
    includeDirs: false,
    match: [/\.(ts|tsx)$/],
    skip: [/node_modules/, /\.d\.ts$/],
  })) {
    const promise = (async () => {
      const packageContext = findRelevantContext(entry.path, contexts);
      if (!packageContext) return;

      try {
        console.log(entry.path);
        const fileContent = await Deno.readTextFile(entry.path);
        const imports = await extractSpecifierImports(fileContent);
        imports.forEach((imp) => packageContext.imports.add(imp));
      } catch (error) {
        console.warn(`Error processing ${entry.path}:`, error.message);
      }
    })();

    fileProcessingPromises.push(promise);
  }

  await Promise.all(fileProcessingPromises);

  // Convert contexts to result output
  for (const context of contexts.values()) {
    const relPath = relative(rootDir, context.packagePath);
    result[relPath] = {
      packageName: context.packageJson.name,
      specifierImports: Array.from(context.imports)
        .sort()
        .filter((imp) => {
          // Filter imports that are actually dependencies
          const allDeps = {
            ...context.packageJson.dependencies,
            ...context.packageJson.devDependencies,
            ...context.packageJson.peerDependencies,
          };
          return imp in allDeps;
        }),
    };
  }

  return result;
}

function findRelevantContext(
  filePath: string,
  contexts: Map<string, PackageContext>
): PackageContext | undefined {
  let currentPath = dirname(filePath);
  while (currentPath.length > 1) {
    const context = contexts.get(currentPath);
    if (context) return context;
    currentPath = dirname(currentPath);
  }
  return undefined;
}

interface DenoRootConfig {
  workspaces: string[];
  imports: Record<string, string>; // For explicit workspace versions
}

interface DenoPackageConfig {
  name: string;
  version: string;
  exports: Record<string, string>;
  imports: Record<string, string>;
}

async function createDenoConfigs(rootDir: string, scanResult: ResultOutput): Promise<void> {
  const workspaces = Object.keys(scanResult).map((path) => `./${path}`);

  // Create a map of workspace packages with their versions
  const workspaceVersions: Record<string, string> = {};
  for (const [packagePath, packageInfo] of Object.entries(scanResult)) {
    const packageJsonPath = `${rootDir}/${packagePath}/package.json`;
    try {
      const packageJson = JSON.parse(await Deno.readTextFile(packageJsonPath)) as PackageJson;
      workspaceVersions[packageInfo.packageName] = packageJson.version || '0.0.0';
    } catch (error) {
      console.warn(`Error reading package.json for ${packagePath}:`, error.message);
    }
  }

  // Create root deno.json with workspaces and explicit workspace versions
  const rootImports: Record<string, string> = {};
  Object.entries(workspaceVersions).forEach(([name, version]) => {
    rootImports[name] = `jsr:${name}@${version}`;
  });

  const rootConfig: DenoRootConfig = {
    version: '0.0.0',
    license: 'MIT',
    workspace: workspaces,
    imports: rootImports,
    exclude: ['**/package.json', '**/*.test.tsx', '**/*.stories.tsx'],
    compilerOptions: {
      noErrorTruncation: true,
      jsx: 'react-jsx',
      lib: ['es2022', 'dom', 'dom.iterable', 'dom.asynciterable'],
    },
  };

  await Deno.writeTextFile(`${rootDir}/deno.json`, JSON.stringify(rootConfig, null, 2));

  // Create package-level deno.json files with explicit versions
  for (const [packagePath, packageInfo] of Object.entries(scanResult)) {
    if (!packagePath) continue;
    const fullPackagePath = `${rootDir}/${packagePath}`;
    const packageJsonPath = `${fullPackagePath}/package.json`;

    try {
      const packageJsonContent = await Deno.readTextFile(packageJsonPath);
      const packageJson = JSON.parse(packageJsonContent) as PackageJson;

      const denoConfig = await createPackageDenoConfig(
        packageJson,
        packageInfo.specifierImports,
        workspaceVersions
      );

      await Deno.writeTextFile(`${fullPackagePath}/deno.json`, JSON.stringify(denoConfig, null, 2));
    } catch (error) {
      console.warn(`Error creating deno.json for ${packagePath}:`, error.message);
    }
  }
}

async function createPackageDenoConfig(
  packageJson: PackageJson,
  specifierImports: string[],
  workspaceVersions: Record<string, string>
): Promise<DenoPackageConfig> {
  const exports: Record<string, string> = {
    '.': packageJson.source || './src/index.ts',
  };

  // Handle additional entry points
  if (typeof packageJson.exports === 'object') {
    Object.entries(packageJson.exports).forEach(([key, value]) => {
      if (key !== '.' && typeof value === 'string') {
        exports[key] = value.replace(/\.js$/, '.ts');
      }
    });
  }

  const imports: Record<string, string> = {};
  specifierImports.forEach((imp) => {
    // Handle workspace dependencies explicitly
    if (workspaceVersions[imp]) {
      imports[imp] = `jsr:${imp}@${workspaceVersions[imp]}`;
    }
    // Handle external dependencies
    else if (packageJson.dependencies?.[imp] || packageJson.peerDependencies?.[imp]) {
      const version = (
        packageJson.dependencies?.[imp] ||
        packageJson.peerDependencies?.[imp]?.split('||').at(-1)?.trim() ||
        '*'
      ).replace(/^\^|~/, '');

      if (imp.startsWith('@jsr/')) {
        imports[imp] = `jsr:${imp}@${version}`;
      } else {
        imports[imp] = `npm:${imp}@${version}`;
      }
    }
  });

  return {
    name: packageJson.name,
    version: packageJson.version || '0.0.0',
    exports,
    imports,
  };
}

// Modify the main execution block
if (import.meta.main) {
  try {
    const rootDir = Deno.args[0] || '.';
    console.log('Starting import scan...');
    const result = await scanImports(rootDir);
    console.log('Creating Deno configuration files...');
    await createDenoConfigs(rootDir, result);

    console.log('Scan completed. Results written to imports-scan-result.json');
    console.log('Deno configuration files created in packages');
  } catch (error) {
    console.error('Error:', error.message);
    Deno.exit(1);
  }
}

// @ts-types="npm:types-react@^19.0.0-rc"
import * as React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';

export default function Page() {
  return (
    <Toolbar.Root orientation="vertical">
      <Toolbar.Button>Button</Toolbar.Button>
      <Toolbar.Separator>***</Toolbar.Separator>
      <Toolbar.Link href="#">Link</Toolbar.Link>
    </Toolbar.Root>
  );
}

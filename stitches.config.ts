import { createStitches } from '@stitches/core';

const dest = createStitches({
    theme: {
        colors: {
            white: '#fff',
            gray100: '#ccc',
            gray300: '#aaa',
            black: '#111',
            red: 'crimson',
            green: 'green',
        },
    },
});
export const css: <Composers extends (string | import("@stitches/core/types/util").Function | {
    [name: string]: unknown;
})[], CSS = import("@stitches/core/types/css-util").CSS<{}, {
    colors: {
        white: string;
        gray100: string;
        gray300: string;
        black: string;
        red: string;
        green: string;
    };
}, import("@stitches/core/types/config").DefaultThemeMap, {}>>(...composers: { [K in keyof Composers]: string extends Composers[K] ? Composers[K] : Composers[K] extends string | import("@stitches/core/types/util").Function ? Composers[K] : import("@stitches/core/types/stitches").RemoveIndex<CSS> & {
    variants?: {
        [x: string]: {
            [x: string]: CSS;
            [x: number]: CSS;
        };
    } | undefined;
    compoundVariants?: (("variants" extends keyof Composers[K] ? { [Name in keyof Composers[K][keyof Composers[K] & "variants"]]?: import("@stitches/core/types/util").String | import("@stitches/core/types/util").Widen<keyof Composers[K][keyof Composers[K] & "variants"][Name]> | undefined; } : import("@stitches/core/types/util").WideObject) & {
        css: CSS;
    })[] | undefined;
    defaultVariants?: ("variants" extends keyof Composers[K] ? { [Name_1 in keyof Composers[K][keyof Composers[K] & "variants"]]?: import("@stitches/core/types/util").String | import("@stitches/core/types/util").Widen<keyof Composers[K][keyof Composers[K] & "variants"][Name_1]> | undefined; } : import("@stitches/core/types/util").WideObject) | undefined;
} & CSS & { [K2 in keyof Composers[K]]: K2 extends "compoundVariants" | "defaultVariants" | "variants" ? unknown : K2 extends keyof CSS ? CSS[K2] : unknown; }; }) => import("@stitches/core/types/styled-component").CssComponent<import("@stitches/core/types/styled-component").StyledComponentType<Composers>, import("@stitches/core/types/styled-component").StyledComponentProps<Composers>, {}, CSS> = dest.css;
export const keyframes: (style: {
    [offset: string]: import("@stitches/core/types/css-util").CSS<{}, {
        colors: {
            white: string;
            gray100: string;
            gray300: string;
            black: string;
            red: string;
            green: string;
        };
    }, import("@stitches/core/types/config").DefaultThemeMap, {}>;
}) => {
    (): string;
    name: string;
} = dest.keyframes;

import {
    BoxProps,
    createTheme,
    DEFAULT_THEME,
    defaultVariantColorsResolver,
    getThemeColor,
    MantineColorScheme,
    MantineStyleProp,
    MantineTheme,
    mergeMantineTheme,
    parseThemeColor,
    VariantColorsResolver,
} from "@mantine/core";

const variantColorResolver: VariantColorsResolver = (input) => {
    const defaultColor = defaultVariantColorsResolver(input);

    if (input.variant === "selected")
        return {
            color: "var(--mantine-color-white)",
            background: "var(--mantine-color-blue-light)",
            border: "var(--mantine-color-blue-3)",
            hoverColor: "var(--mantine-color-white)",
            hover: "var(--mantine-color-blue-light)",
        };

    if (input.variant.endsWith("-nohover")) {
        const baseVariant =
            input.variant?.slice(0, input.variant.length - 8) ?? "";
        const defaultColor = defaultVariantColorsResolver({
            ...input,
            variant: baseVariant,
        });
        return {
            ...defaultColor,
            hover: defaultColor.background,
        };
    }

    return defaultColor;
};

export class ThemeManager {
    static colorScheme: MantineColorScheme = "dark";
    static _theme: MantineTheme | null = null;

    static get theme() {
        if (!this._theme) {
            this._theme = this._buildTheme();
        }
        return this._theme;
    }

    static _buildTheme() {
        const themeOverride = createTheme({
            variantColorResolver,
        });
        return mergeMantineTheme(DEFAULT_THEME, themeOverride);
    }

    static getDefaultThemeColor() {
        return getThemeColor(this.colorScheme, this.theme);
    }

    static getThemeColor(color: any) {
        return parseThemeColor({ color, theme: this.theme });
    }

    static resolveVariant<P extends BoxProps>(props: Partial<P>): Partial<P> {
        if (!("variant" in props)) return props;

        const variant = String(props.variant);
        let { c, bg, bd, style, ...rest } = props;

        // some components have a 'color' prop that sets multiple colour properties
        if ("color" in rest && rest.color) bg = rest.color;

        if (!bg) bg = "none";

        const variableColor = this.theme.variantColorResolver({
            color: bg as string,
            theme: this.theme,
            variant,
        });

        const _style = {
            "--variant-color": variableColor.color,
            "--variant-background": variableColor.background,
            "--variant-border": variableColor.border,
            "--variant-hover-color": variableColor.hoverColor,
            "--variant-hover": variableColor.hover,
            ...style,
        } as MantineStyleProp;

        const modifiedProps = {
            style: _style,
            ...rest,
        };
        return modifiedProps as Partial<P>;
    }
}

import {
    BoxProps,
    createTheme,
    DEFAULT_THEME,
    defaultVariantColorsResolver,
    getThemeColor,
    lighten,
    MantineColorScheme,
    MantineStyleProp,
    MantineTheme,
    mergeMantineTheme,
    parseThemeColor,
    VariantColorResolverResult,
    VariantColorsResolverInput,
} from "@mantine/core";

const SELECTED: Partial<VariantColorResolverResult> = {
    color: "var(--mantine-color-white)",
    background: "var(--mantine-color-blue-light)",
    border: "var(--mantine-color-blue-3)",
    //hoverColor: "var(--mantine-color-white)",
    //hover: "var(--mantine-color-blue-light)",
};

const SELECTED_FILLED: Partial<VariantColorResolverResult> = {
    color: "var(--mantine-color-white)",
    background: "var(--mantine-color-blue-light)",
    //hoverColor: "var(--mantine-color-white)",
    //hover: "var(--mantine-color-blue-light)",
};

const SELECTED_OUTLINE: Partial<VariantColorResolverResult> = {
    color: "var(--mantine-color-white)",
    border: "var(--mantine-color-blue-3)",
};

export interface VariantComponentColor extends VariantColorsResolverInput {
    text?: string;
    background?: string;
    border?: string;
    textHover?: string;
    backgroundHover?: string;
}

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
            variantColorResolver: this._resolveVariant.bind(this),
        });
        return mergeMantineTheme(DEFAULT_THEME, themeOverride);
    }

    static getDefaultThemeColor() {
        return getThemeColor(this.colorScheme, this.theme);
    }

    static getThemeColor(color: any) {
        return parseThemeColor({ color, theme: this.theme });
    }

    static extractColorFromProps<P extends BoxProps>(props: Partial<P>) {
        if (!("variant" in props)) return null;

        let { c = "none", bg = "none", bd = "none", ...rest } = props;

        // buttons can have a 'color' prop that sets multiple colour properties
        let color: string | undefined = undefined;
        if ("color" in rest) {
            color = rest.color as string;
            delete rest.color;
        }

        return {
            props: rest,
            color: this._resolveVariant({
                color: color,
                theme: this.theme,
                variant: String(rest.variant),
                text: c as string,
                background: bg as string,
                border: bd as string,
            }),
        };
    }

    static _resolveVariant({
        color,
        theme,
        variant,
        gradient,
        autoContrast,
        text,
        background,
        border,
        textHover,
        backgroundHover,
    }: VariantComponentColor) {
        const baseVariant = this._isModifiedVariant(variant)
            ? this._getBaseVariant(variant)
            : variant;
        const defaultColor = defaultVariantColorsResolver({
            color: color ?? "none",
            theme,
            variant: baseVariant,
            gradient,
            autoContrast,
        });

        if (text) defaultColor.color = text;
        if (background) defaultColor.background = background;
        if (border) defaultColor.border = border;
        if (textHover) defaultColor.hoverColor = textHover;
        if (backgroundHover) defaultColor.hover = backgroundHover;

        let variantColor = defaultColor;
        if (variant.startsWith("selected-filled"))
            variantColor = { ...defaultColor, ...SELECTED_FILLED };
        else if (variant.startsWith("selected-outline"))
            variantColor = { ...defaultColor, ...SELECTED_OUTLINE };
        else if (variant.startsWith("selected"))
            variantColor = { ...defaultColor, ...SELECTED };
        else if (variant.startsWith("highlighted")) {
            const bg = lighten(
                defaultColor.background ?? this.getDefaultThemeColor(),
                0.1,
            );
            variantColor = {
                ...defaultColor,
                background: bg,
                hover: bg,
            };
        }

        if (variant.endsWith("-hover")) {
            const hover = lighten(
                variantColor.background ?? this.getDefaultThemeColor(),
                0.05,
            );
            return { ...variantColor, hoverColor: variantColor.color, hover };
        } else if (variant.endsWith("-nohover")) {
            return {
                ...variantColor,
                hoverColor: variantColor.color,
                hover: variantColor.background,
            };
        }

        return variantColor;
    }

    static _isModifiedVariant(variant: string) {
        return variant.endsWith("-hover") || variant.endsWith("-nohover");
    }

    static _getBaseVariant(variant: string) {
        return variant?.slice(0, variant.length - 8) ?? "";
    }

    static applyVariantToStyle<P extends BoxProps>(
        props: Partial<P>,
    ): Partial<P> {
        const result = this.extractColorFromProps(props);
        if (!result) return props;

        const { props: _props, color: variableColor } = result;
        const { style, ...rest } = _props;
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

    static applyVariantToButtonStyle<P extends BoxProps>(
        props: Partial<P>,
    ): Partial<P> {
        const result = this.extractColorFromProps(props);
        if (!result) return props;

        const { props: _props, color: variableColor } = result;
        const { style, ...rest } = _props;
        const _style = {
            "--button-color": variableColor.color,
            "--button-bg": variableColor.background,
            "--button-bd": variableColor.border,
            "--button-hover-color": variableColor.hoverColor,
            "--button-hover": variableColor.hover,
            ...style,
        } as MantineStyleProp;

        const modifiedProps = {
            style: _style,
            ...rest,
        };
        return modifiedProps as Partial<P>;
    }
}

import {
    BoxProps,
    DEFAULT_THEME,
    defaultVariantColorsResolver,
    getThemeColor,
    lighten,
    MantineColorScheme,
    MantineStyleProp,
    VariantColorResolverResult,
} from "@mantine/core";

import {
    BaseButtonSettings,
    BaseElementSettings,
    DynamicStyleArguments,
} from "@/interface";

type PropsWithDynamicStyle<P extends BoxProps> = Partial<P> & {
    variant?: string;
    color?: string;
} & BaseElementSettings;
type PropsWithoutDynamicStyle<P extends BoxProps> = Partial<
    Omit<P, "variant" | "color" | "c" | "bg" | "bd">
>;

export class StyleManager {
    get theme() {
        return DEFAULT_THEME;
    }

    get colorScheme(): MantineColorScheme {
        return "dark";
    }

    get defaultThemeColor() {
        return getThemeColor(this.colorScheme, this.theme);
    }

    resolveDivStyleProps<P extends BoxProps>(
        props: PropsWithDynamicStyle<P>,
        dynamicArgs?: DynamicStyleArguments | string,
    ): Partial<P> {
        const { general, dynamicArgs: _dynamicArgs } =
            this._extractDynamicStyleArguments(props, dynamicArgs);
        const dynamicStyle = this._createDynamicStyle(_dynamicArgs);
        const { style, ...rest } = general;
        const modifiedProps = {
            style: {
                ...this._createDynamicDivStyle(dynamicStyle),
                ...style,
            } as MantineStyleProp,
            ...rest,
        };
        return modifiedProps as Partial<P>;
    }

    createDynamicDivStyle(dynamicArgs: DynamicStyleArguments) {
        return this._createDynamicDivStyle(
            this._createDynamicStyle(dynamicArgs),
        );
    }

    resolveButtonStyleProps<P extends BaseButtonSettings>(
        props: PropsWithDynamicStyle<P>,
        dynamicArgs?: DynamicStyleArguments | string,
    ): Partial<P> {
        const { general, dynamicArgs: _dynamicArgs } =
            this._extractDynamicStyleArguments(props, dynamicArgs);
        const dynamicStyle = this._createDynamicStyle(_dynamicArgs);
        const { style, ...rest } = general;
        const modifiedProps = {
            style: {
                ...this._createDynamicButtonStyle(dynamicStyle),
                ...style,
            } as MantineStyleProp,
            ...rest,
        };
        return modifiedProps as Partial<P>;
    }

    createDynamicButtonStyle(dynamicArgs: DynamicStyleArguments) {
        return this._createDynamicButtonStyle(
            this._createDynamicStyle(dynamicArgs),
        );
    }

    _createDynamicDivStyle(dynamicStyle: VariantColorResolverResult) {
        return {
            "--dynamic-text-color": dynamicStyle.color,
            "--dynamic-background-color": dynamicStyle.background,
            "--dynamic-border": dynamicStyle.border,
            "--dynamic-hover-text-color": dynamicStyle.hoverColor,
            "--dynamic-hover-background-color": dynamicStyle.hover,
        };
    }

    _createDynamicButtonStyle(dynamicStyle: VariantColorResolverResult) {
        return {
            "--button-color": dynamicStyle.color,
            "--button-bg": dynamicStyle.background,
            "--button-bd": dynamicStyle.border,
            "--button-hover-color": dynamicStyle.hoverColor,
            "--button-hover": dynamicStyle.hover,
        };
    }

    _extractDynamicStyleArguments<P extends BoxProps>(
        props: PropsWithDynamicStyle<P>,
        dynamicArgs?: DynamicStyleArguments | string,
    ): {
        general: PropsWithoutDynamicStyle<P>;
        dynamicArgs: DynamicStyleArguments;
    } {
        // buttons can have a 'color' prop that sets multiple colour properties
        let { variant, color, c, bg, bd, dynamicStyle, ...rest } = props;

        if (!dynamicArgs) {
            if (dynamicStyle) dynamicArgs = { ...dynamicStyle };
            else if (variant !== undefined) dynamicArgs = { base: variant };
            else dynamicArgs = { base: "filled" };
        } else if (typeof dynamicArgs === "string")
            dynamicArgs = { base: dynamicArgs };
        else dynamicArgs = { ...dynamicArgs };

        // default colour
        if (!dynamicArgs.defaultColor && color)
            dynamicArgs.defaultColor = color;

        // text colour
        if (!dynamicArgs.textColor && c) dynamicArgs.textColor = c as string;

        // background colour
        if (dynamicArgs.backgroundColor && bg)
            dynamicArgs.backgroundColor = bg as string;

        // border style
        if (dynamicArgs.borderStyle && bd)
            dynamicArgs.borderStyle = bd as string;

        return { general: rest as PropsWithoutDynamicStyle<P>, dynamicArgs };
    }

    _createDynamicStyle(dynamicArgs: DynamicStyleArguments) {
        let dynamicStyle = defaultVariantColorsResolver({
            color: dynamicArgs.defaultColor ?? "none",
            theme: this.theme,
            variant: dynamicArgs.base ?? "",
            gradient: undefined,
            autoContrast: undefined,
        });

        // text colour
        if (dynamicArgs.textColor) dynamicStyle.color = dynamicArgs.textColor;

        // background colour
        if (dynamicArgs.backgroundColor)
            dynamicStyle.background = dynamicArgs.backgroundColor;

        // border style
        if (dynamicArgs.borderStyle)
            dynamicStyle.border = dynamicArgs.borderStyle;

        // selected style
        if (dynamicArgs.selected && dynamicArgs.selected.enabled) {
            dynamicStyle.color = "var(--mantine-color-white)";
            if (dynamicArgs.selected.background ?? true)
                dynamicStyle.background = "var(--mantine-color-blue-light)";
            if (dynamicArgs.selected.border)
                dynamicStyle.border = "var(--mantine-color-blue-3)";
        }

        // highlighted style
        if (dynamicArgs.highlighted) {
            dynamicStyle.background = lighten(
                dynamicStyle.background ?? this.defaultThemeColor,
                0.1,
            );
        }

        // hover style
        if (dynamicArgs.hover) {
            const hover = dynamicArgs.hover;
            if (hover.base === "change") {
                if (hover.textColor !== undefined) {
                    if (typeof hover.textColor == "string")
                        dynamicStyle.hoverColor = hover.textColor;
                    else
                        dynamicStyle.hoverColor = lighten(
                            dynamicStyle.background ?? this.defaultThemeColor,
                            hover.textColor,
                        );
                }
                if (hover.backgroundColor !== undefined) {
                    if (typeof hover.backgroundColor == "string")
                        dynamicStyle.hover = hover.backgroundColor;
                    else
                        dynamicStyle.hover = lighten(
                            dynamicStyle.background ?? this.defaultThemeColor,
                            hover.backgroundColor,
                        );
                }
            } else if (hover.base === "same") {
                dynamicStyle.hoverColor = dynamicStyle.color;
                dynamicStyle.hover = dynamicStyle.background;
            }
            // otherwise, default hover style is preserved
        }

        return dynamicStyle;
    }
}

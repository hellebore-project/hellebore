import {
    DEFAULT_THEME,
    defaultVariantColorsResolver,
    getThemeColor,
    parseThemeColor,
    VariantColorsResolver,
} from "@mantine/core";

export const DEFAULT_COLOR_SCHEME = "dark";

export const variantColorResolver: VariantColorsResolver = (input) => {
    if (input.variant === "selected")
        return {
            color: "var(--mantine-color-blue-4)",
            background: "var(--mantine-color-blue-light)",
            hover: "var(--mantine-color-blue-light)",
            border: "none",
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

    return defaultVariantColorsResolver(input);
};

export class ThemeManager {
    static getDefaultThemeColor() {
        return getThemeColor(DEFAULT_COLOR_SCHEME, DEFAULT_THEME);
    }

    static getThemeColor(color: any) {
        return parseThemeColor({ color, theme: DEFAULT_THEME });
    }
}

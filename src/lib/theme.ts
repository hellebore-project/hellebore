import { DEFAULT_THEME, getThemeColor, parseThemeColor } from "@mantine/core";

export const DEFAULT_COLOR_SCHEME = "dark";

export class ThemeManager {
    static getDefaultThemeColor() {
        return getThemeColor("dark", DEFAULT_THEME);
    }

    static getThemeColor(color: any) {
        return parseThemeColor({ color, theme: DEFAULT_THEME });
    }
}

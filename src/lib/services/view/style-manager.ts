import { DEFAULT_THEME, MantineColorScheme } from "@mantine/core";

export class StyleManager {
    get theme() {
        return DEFAULT_THEME;
    }

    get colorScheme(): MantineColorScheme {
        return "dark";
    }
}

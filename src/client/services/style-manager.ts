import { DEFAULT_THEME, MantineColorScheme } from "@mantine/core";

export class StyleManager {
    readonly colorScheme: MantineColorScheme = "dark";

    get theme() {
        return DEFAULT_THEME;
    }
}

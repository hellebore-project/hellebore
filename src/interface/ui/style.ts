import { MantineColor } from "@mantine/core";

export interface HoverStyleArguments {
    base: "default" | "same" | "change";
    textColor?: MantineColor | number;
    backgroundColor?: MantineColor | number;
}

export interface SelectedStyleArguments {
    enabled: boolean;
    background?: boolean;
    border?: boolean;
}

export interface DynamicStyleArguments {
    base?: string;
    defaultColor?: MantineColor;
    textColor?: string;
    backgroundColor?: string;
    borderStyle?: string;
    hover?: HoverStyleArguments;
    highlighted?: boolean;
    selected?: SelectedStyleArguments;
}

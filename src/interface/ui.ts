import {
    BoxProps,
    ButtonProps,
    ComboboxItem,
    ContainerProps,
    GridColProps,
    GridProps,
    GroupProps,
    PaperProps,
    TableProps,
    TextInputProps,
    TextProps,
} from "@mantine/core";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";

// divs
export type BaseBoxSettings = BoxProps;
export type BasePaperSettings = PaperProps & HTMLAttributes<HTMLDivElement>;
export type BaseContainerSettings = ContainerProps;
export type BaseGridSettings = GridProps;
export type BaseGridColSettings = GridColProps;
export type BaseGroupSettings = GroupProps;
export type BaseTableSettings = TableProps;

// paragraphs
export type BaseTextSettings = TextProps & HTMLAttributes<HTMLParagraphElement>;

// inputs
export type BaseButtonSettings = ButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement>;
export type BaseTextInputSettings = TextInputProps;
export type OptionData = ComboboxItem;

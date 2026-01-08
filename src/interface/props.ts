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
export type BaseBoxProps = BoxProps;
export type BasePaperProps = PaperProps & HTMLAttributes<HTMLDivElement>;
export type BaseContainerProps = ContainerProps;
export type BaseGridProps = GridProps;
export type BaseGridColProps = GridColProps;
export type BaseGroupProps = GroupProps;
export type BaseTableProps = TableProps;

// paragraphs
export type BaseTextProps = TextProps & HTMLAttributes<HTMLParagraphElement>;

// inputs
export type BaseButtonProps = ButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement>;
export type BaseTextInputProps = TextInputProps;
export type OptionData = ComboboxItem;

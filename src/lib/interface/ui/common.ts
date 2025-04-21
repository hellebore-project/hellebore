import {
    BoxProps,
    ButtonProps,
    ContainerProps,
    GridColProps,
    GridProps,
    GroupProps,
    PaperProps,
    TableProps,
} from "@mantine/core";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";

export type BasePaperSettings = PaperProps & HTMLAttributes<HTMLDivElement>;
export type BaseBoxSettings = BoxProps;
export type BaseContainerSettings = ContainerProps;
export type BaseGridSettings = GridProps;
export type BaseGridColSettings = GridColProps;
export type BaseGroupSettings = GroupProps;
export type BaseButtonSettings = ButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement>;
export type BaseTableSettings = TableProps;

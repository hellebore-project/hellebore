import {
    ButtonProps,
    ContainerProps,
    GridColProps,
    GridProps,
    PaperProps,
} from "@mantine/core";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";

export type BasePaperSettings = PaperProps & HTMLAttributes<HTMLDivElement>;
export type BaseContainerSettings = ContainerProps;
export type BaseGridSettings = GridProps;
export type BaseGridColSettings = GridColProps;
export type BaseButtonSettings = ButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement>;

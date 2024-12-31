import { ButtonProps, Divider, PaperProps, Space } from "@mantine/core";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";

export const SPACE = <Space h="lg" />;
export const DIVIDER = <Divider my="sm" />;

export type BasePaperSettings = PaperProps & HTMLAttributes<HTMLDivElement>;
export type BaseButtonSettings = ButtonProps &
    ButtonHTMLAttributes<HTMLButtonElement>;

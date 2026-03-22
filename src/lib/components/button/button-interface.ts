import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
} from "svelte/elements";
import { type VariantProps } from "tailwind-variants";

import { type WithElementRef } from "@/lib/utils.js";

import type { ButtonVariants } from "./button-variants";

export type ButtonVariant = VariantProps<typeof ButtonVariants>["variant"];
export type ButtonSize = VariantProps<typeof ButtonVariants>["size"];
export type ButtonColor = VariantProps<typeof ButtonVariants>["color"];

export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes> & {
        variant?: ButtonVariant;
        size?: ButtonSize;
        color?: ButtonColor;
    };

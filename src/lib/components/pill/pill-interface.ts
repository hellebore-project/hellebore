import type { HTMLAttributes } from "svelte/elements";
import { type VariantProps } from "tailwind-variants";

import { type WithElementRef } from "@/lib/utils.js";

import type { PillVariants } from "./pill-variants";

export type PillVariant = VariantProps<typeof PillVariants>["variant"];
export type PillSize = VariantProps<typeof PillVariants>["size"];

export type PillProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
    variant?: PillVariant;
    size?: PillSize;
};

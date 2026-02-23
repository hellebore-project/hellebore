import type {
    HTMLInputAttributes,
    HTMLInputTypeAttribute,
} from "svelte/elements";
import { type VariantProps } from "tailwind-variants";

import { type WithElementRef } from "@/lib/utils.js";

import type { InputVariants } from "./input-variants";

export type InputType = Exclude<HTMLInputTypeAttribute, "file">;
export type InputVariant = VariantProps<typeof InputVariants>["variant"];
export type InputSize = VariantProps<typeof InputVariants>["size"];
export type InputShape = VariantProps<typeof InputVariants>["shape"];
export type InputSeverity = VariantProps<typeof InputVariants>["severity"];

export type InputProps = WithElementRef<
    Omit<HTMLInputAttributes, "type" | "size" | "aria-invalid"> &
        (
            | { type: "file"; files?: FileList }
            | { type?: InputType; files?: undefined }
        ) & {
            variant?: InputVariant;
            size?: InputSize;
            shape?: InputShape;
            severity?: InputSeverity;
        }
>;

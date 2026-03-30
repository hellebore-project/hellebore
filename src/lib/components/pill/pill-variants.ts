import { tv } from "tailwind-variants";

export const PillVariants = tv({
    base: "inline-flex items-center justify-center rounded-sm font-small whitespace-nowrap transition-colors",
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground",
            outline: "border border-border bg-background text-foreground",
        },
        size: {
            sm: "px-2 py-1 text-xs",
            md: "px-3 py-1.5 text-sm",
            lg: "px-4 py-2 text-base",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "md",
    },
});

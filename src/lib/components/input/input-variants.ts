import { tv } from "tailwind-variants";

export const InputVariants = tv({
    base:
        "flex w-full min-w-0 " +
        "border shadow-xs transition-[color,box-shadow] outline-none " +
        "selection:bg-primary selection:text-primary-foreground ring-offset-background " +
        "placeholder:text-muted-foreground " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    variants: {
        variant: {
            default: "bg-background border-input dark:bg-input/30",
            outline: "bg-transparent border-input",
            ghost: "bg-transparent border-transparent",
        },
        size: {
            default: "h-9",
            sm: "h-8 text-sm",
            lg: "h-10 text-lg",
            xl: "h-12 text-xl",
            h1: "h-18 text-5xl font-semibold",
            h2: "h-14 text-4xl font-semibold",
            h3: "h-12 text-3xl font-semibold",
            h4: "h-9 text-2xl font-semibold",
            h5: "h-8 text-xl font-semibold",
            h6: "h-7 text-lg font-semibold",
        },
        shape: {
            round: "rounded-md",
            sharp: "rounded-none",
        },
        severity: {
            normal: "",
            error:
                "border-error-foreground text-error-foreground " +
                "focus-visible:border-error-foreground focus-visible:ring-error-foreground/50",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

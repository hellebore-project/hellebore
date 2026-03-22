import { tv } from "tailwind-variants";

export const ButtonVariants = tv({
    base:
        "inline-flex shrink-0 items-center justify-center gap-2 " +
        "rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none " +
        "cursor-pointer " +
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 " +
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    variants: {
        variant: {
            default:
                "bg-(--button-background) text-(--button-foreground) hover:bg-(--button-background)/90 shadow-xs",
            outline:
                "bg-background text-(--button-background) border border-(--button-background) shadow-xs " +
                "hover:bg-accent ",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        },
        size: {
            md: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-sm": "size-8",
            "icon-lg": "size-10",
        },
        color: {
            primary: "button-primary",
            secondary: "button-secondary",
            destructive:
                "button-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "md",
        color: "primary",
    },
});

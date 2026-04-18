<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
    import { cn } from "@/lib/utils.js";

    let {
        ref = $bindable(null),
        class: className,
        inset,
        variant = "default",
        ...restProps
    }: ContextMenuPrimitive.ItemProps & {
        inset?: boolean;
        variant?: "default" | "destructive";
    } = $props();
</script>

<ContextMenuPrimitive.Item
    bind:ref
    data-slot="context-menu-item"
    data-inset={inset}
    data-variant={variant}
    class={cn(
        "relative flex items-center gap-1.5 px-1.5 py-1 text-sm data-inset:pl-7",
        "outline-hidden rounded-md select-none",
        "cursor-default",
        "group/context-menu-item",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "focus:bg-accent focus:text-accent-foreground focus:*:[svg]:text-accent-foreground",
        "data-[variant=destructive]:text-destructive",
        "data-[variant=destructive]:focus:bg-destructive/10",
        "dark:data-[variant=destructive]:focus:bg-destructive/20",
        "data-[variant=destructive]:focus:text-destructive",
        "data-[variant=destructive]:*:[svg]:text-destructive",
        "[&_svg]:shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
    )}
    {...restProps}
/>

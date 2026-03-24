<script lang="ts">
    import { cn, type WithElementRef } from "@/lib/utils.js";
    import type { HTMLAttributes } from "svelte/elements";

    let {
        ref = $bindable(null),
        class: className,
        children,
        ...restProps
    }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<div
    bind:this={ref}
    data-slot="sidebar-menu-badge"
    data-sidebar="menu-badge"
    class={cn(
        "absolute flex items-center justify-center h-5 min-w-5 right-1 px-1 text-xs font-medium",
        "text-sidebar-foreground rounded-md",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground",
        "pointer-events-none",
        "peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1",
        "tabular-nums select-none group-data-[collapsible=icon]:hidden",
        className,
    )}
    {...restProps}
>
    {@render children?.()}
</div>

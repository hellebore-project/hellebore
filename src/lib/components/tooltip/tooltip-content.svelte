<script lang="ts">
    import { Tooltip as TooltipPrimitive } from "bits-ui";
    import type { ComponentProps } from "svelte";

    import { cn, type WithoutChildrenOrChild } from "@/lib/utils.js";

    import TooltipPortal from "./tooltip-portal.svelte";

    let {
        ref = $bindable(null),
        class: className,
        sideOffset = 0,
        side = "top",
        children,
        portalProps,
        ...restProps
    }: TooltipPrimitive.ContentProps & {
        portalProps?: WithoutChildrenOrChild<
            ComponentProps<typeof TooltipPortal>
        >;
    } = $props();
</script>

<TooltipPortal {...portalProps}>
    <TooltipPrimitive.Content
        bind:ref
        data-slot="tooltip-content"
        {sideOffset}
        {side}
        class={cn(
            "z-50 w-fit px-3 py-1.5 origin-(--bits-tooltip-content-transform-origin)",
            "bg-foreground rounded-md",
            "text-background text-xs text-balance",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2",
            "data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2",
            className,
        )}
        {...restProps}
    >
        {@render children?.()}
    </TooltipPrimitive.Content>
</TooltipPortal>

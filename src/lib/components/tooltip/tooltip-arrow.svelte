<script lang="ts">
    import { Tooltip as TooltipPrimitive } from "bits-ui";

    import { cn } from "@/lib/utils.js";

    let {
        class: className,
        children,
        ...restProps
    }: TooltipPrimitive.ArrowProps = $props();
</script>

<TooltipPrimitive.Arrow {...restProps}>
    {#snippet child({ props })}
        <div
            class={cn(
                "bg-foreground z-50 size-2.5 rotate-45 rounded-[2px]",
                "data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%_+_2px)]",
                "data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%_+_1px)]",
                "data-[side=right]:translate-x-[calc(50%_+_2px)] data-[side=right]:translate-y-1/2",
                "data-[side=left]:-translate-y-[calc(50%_-_3px)]",
                className,
            )}
            {...props}
        ></div>
    {/snippet}
    {@render children?.()}
</TooltipPrimitive.Arrow>

<script lang="ts">
    import { cn, type WithElementRef } from "@/lib/utils.js";
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    let {
        ref = $bindable(null),
        class: className,
        children,
        child,
        ...restProps
    }: WithElementRef<HTMLButtonAttributes> & {
        child?: Snippet<[{ props: Record<string, unknown> }]>;
    } = $props();

    const mergedProps = $derived({
        class: cn(
            "absolute flex items-center justify-center top-3.5 right-3 w-5 p-0 aspect-square",
            "text-sidebar-foreground rounded-md ring-sidebar-ring outline-hidden",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
            "transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden",
            "[&>svg]:size-4 [&>svg]:shrink-0",
            className,
        ),
        "data-slot": "sidebar-group-action",
        "data-sidebar": "group-action",
        ...restProps,
    });
</script>

{#if child}
    {@render child({ props: mergedProps })}
{:else}
    <button bind:this={ref} {...mergedProps}>
        {@render children?.()}
    </button>
{/if}

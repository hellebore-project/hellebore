<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
    import { cn, type WithoutChildrenOrChild } from "@/lib/utils.js";
    import type { Snippet } from "svelte";
    import CheckIcon from "@lucide/svelte/icons/check";

    let {
        ref = $bindable(null),
        checked = $bindable(false),
        indeterminate = $bindable(false),
        class: className,
        inset,
        children: childrenProp,
        ...restProps
    }: WithoutChildrenOrChild<ContextMenuPrimitive.CheckboxItemProps> & {
        inset?: boolean;
        children?: Snippet;
    } = $props();
</script>

<ContextMenuPrimitive.CheckboxItem
    bind:ref
    bind:checked
    bind:indeterminate
    data-slot="context-menu-checkbox-item"
    data-inset={inset}
    class={cn(
        "relative flex items-center gap-1.5",
        "py-1 pr-8 pl-1.5 data-inset:pl-7 text-sm",
        "rounded-md outline-hidden select-none cursor-default",
        "focus:bg-accent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
        className,
    )}
    {...restProps}
>
    {#snippet children({ checked })}
        <span class="absolute right-2 pointer-events-none">
            {#if checked}
                <CheckIcon />
            {/if}
        </span>
        {@render childrenProp?.()}
    {/snippet}
</ContextMenuPrimitive.CheckboxItem>

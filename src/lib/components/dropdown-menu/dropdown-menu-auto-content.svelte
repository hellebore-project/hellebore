<script lang="ts">
    import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

    import { DIVIDER_DATA, type DropdownMenuItemData } from "./dropdown-menu-interface";
    import DropdownMenuContent from "./dropdown-menu-content.svelte";
    import DropdownMenuItem from "./dropdown-menu-item.svelte";
    import DropdownMenuLabel from "./dropdown-menu-label.svelte";
    import DropdownMenuSeparator from "./dropdown-menu-separator.svelte";

    interface AutoDropdownContentProps extends DropdownMenuPrimitive.ContentProps {
        items: DropdownMenuItemData[];
        itemProps?: DropdownMenuPrimitive.ItemProps,
    }

    let {
        items,
        itemProps,
        side = "bottom",
        ...rest
    }: AutoDropdownContentProps = $props();

    function _generateItemKey(item: DropdownMenuItemData, index: number) {
        let itemStr: string;
        if (typeof item === "string") itemStr = item;
        else itemStr = item.label;
        return `${index}-${itemStr}`;
    }
</script>

<DropdownMenuContent side={side} {...rest}>
    {#each items as item, i (_generateItemKey(item, i))}
        {#if item === DIVIDER_DATA}
            <DropdownMenuSeparator />
        {:else if typeof item === "string"}
            <DropdownMenuLabel>{item}</DropdownMenuLabel>
        {:else}
            <DropdownMenuItem
                onclick={() => item.onClick?.()}
                {...itemProps}
            >
                {item.label}
            </DropdownMenuItem>
        {/if}
    {/each}
</DropdownMenuContent>

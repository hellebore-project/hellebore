<script lang="ts" module>
    export const DIVIDER_DATA = "DIVIDER";

    export interface TextItemData {
        label: string;
        onSelect?: () => void;
    }

    export type ItemData = TextItemData | string;

    export interface AutoContentProps extends MenubarPrimitive.ContentProps {
        items: ItemData[];
        itemProps?: MenubarPrimitive.ItemProps;
    }

    function _generateItemKey(item: ItemData, index: number) {
        let itemStr: string;
        if (typeof item === "string") itemStr = item;
        else itemStr = item.label;
        return `${index}-${itemStr}`;
    }
</script>

<script lang="ts">
    import { Menubar as MenubarPrimitive } from "bits-ui";

    import MenubarContent from "./menubar-content.svelte";
    import MenubarItem from "./menubar-item.svelte";
    import MenubarLabel from "./menubar-label.svelte";
    import MenubarSeparator from "./menubar-separator.svelte";

    let {
        items,
        itemProps,
        side = "bottom",
        ...rest
    }: AutoContentProps = $props();
</script>

<MenubarContent {side} {...rest}>
    {#each items as item, i (_generateItemKey(item, i))}
        {#if item === DIVIDER_DATA}
            <MenubarSeparator />
        {:else if typeof item === "string"}
            <MenubarLabel>{item}</MenubarLabel>
        {:else}
            <MenubarItem onSelect={() => item.onSelect?.()} {...itemProps}>
                {item.label}
            </MenubarItem>
        {/if}
    {/each}
</MenubarContent>

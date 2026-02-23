<script lang="ts">
	import { cn } from "@/lib/utils.js";
	import VerticalTabsItem from "./vertical-tabs-item.svelte";
	import type { VerticalTabsProps } from "./vertical-tabs-interface";

	let { items, activeValue, onSelect, class: className }: VerticalTabsProps = $props();
</script>

<div
	class={cn("flex flex-col", className)}
	role="tablist"
	data-slot="vertical-tabs"
>
	{#each items as item, i (`${i}-${item.value}`)}
		<VerticalTabsItem
			label={item.label}
			value={item.value}
			active={item.value === activeValue}
			onclick={() => onSelect?.(item.value)}
			class={cn(
				i === 0 && "rounded-t-md",
				i === items.length - 1 && "rounded-b-md"
			)}
		/>
	{/each}
</div>

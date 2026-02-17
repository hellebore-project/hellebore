<script lang="ts">
	import { cn } from "@/lib/utils.js";
	import { Combobox as ComboboxPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComboboxPrimitive.ItemProps = $props();
</script>

<ComboboxPrimitive.Item
	bind:ref
	data-slot="combobox-item"
	class={cn(
		"rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize",
		className
	)}
	{...restProps}
/>

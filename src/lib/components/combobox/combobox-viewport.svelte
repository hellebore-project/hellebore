<script lang="ts">
	import { cn } from "@/lib/utils.js";
	import { Combobox as ComboboxPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComboboxPrimitive.ViewportProps = $props();
</script>

<ComboboxPrimitive.Viewport
	bind:ref
	data-slot="combobox-viewport"
	class={cn("p-1", className)}
	{...restProps}
/>

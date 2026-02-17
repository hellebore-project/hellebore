<script lang="ts">
	import { cn } from "@/lib/utils.js";
	import { Combobox as ComboboxPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComboboxPrimitive.ScrollUpButtonProps = $props();
</script>

<ComboboxPrimitive.ScrollUpButton
	bind:ref
	data-slot="combobox-scroll-up-button"
	class={cn("flex w-full items-center justify-center py-1", className)}
	{...restProps}
/>

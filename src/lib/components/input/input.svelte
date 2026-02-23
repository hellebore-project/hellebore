<script lang="ts">
	import { cn } from "@/lib/utils.js";

    import type { InputProps } from "./input-interface";
    import { InputVariants } from "./input-variants";

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		variant = "default",
		size = "default",
		shape = "round",
		severity = "normal",
		"data-slot": dataSlot = "input",
		...restProps
	}: InputProps = $props();

</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			InputVariants({ variant, size, shape, severity }),
			"px-3 pt-1.5",
			className
		)}
		type="file"
		bind:files
		bind:value
		aria-invalid={severity === "error"}
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			InputVariants({ variant, size, shape, severity }),
			"px-3 py-1",
			className
		)}
		{type}
		bind:value
		aria-invalid={severity === "error"}
		{...restProps}
	/>
{/if}

<script lang="ts" module>
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import { cn, type WithElementRef } from "@/lib/utils.js";
	import { type VariantProps, tv } from "tailwind-variants";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	const inputVariants = tv({
		base: "selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
		variants: {
			variant: {
				default: "bg-background border-input",
				outline: "bg-transparent border-input",
				ghost: "bg-transparent border-transparent",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type InputVariant = VariantProps<typeof inputVariants>["variant"];

	type InputProps = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined }) & {
				variant?: InputVariant;
			}
	>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		variant = "default",
		"data-slot": dataSlot = "input",
		...restProps
	}: InputProps = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			inputVariants({ variant }),
			"px-3 pt-1.5 text-sm font-medium",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			inputVariants({ variant }),
			"px-3 py-1 text-base md:text-sm",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}

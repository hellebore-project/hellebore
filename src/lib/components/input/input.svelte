<script lang="ts" module>
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import { cn, type WithElementRef } from "@/lib/utils.js";
	import { type VariantProps, tv } from "tailwind-variants";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	const inputVariants = tv({
		base: "selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex w-full min-w-0 rounded-md border shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
		variants: {
			variant: {
				default: "bg-background border-input dark:bg-input/30",
				outline: "bg-transparent border-input",
				ghost: "bg-transparent border-transparent",
			},
			size: {
				default: "h-9",
				sm: "h-8 text-sm",
				lg: "h-10 text-lg",
				xl: "h-12 text-xl",
				h1: "h-18 text-5xl font-semibold",
				h2: "h-14 text-4xl font-semibold",
				h3: "h-12 text-3xl font-semibold",
				h4: "h-9 text-2xl font-semibold",
				h5: "h-8 text-xl font-semibold",
				h6: "h-7 text-lg font-semibold",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type InputVariant = VariantProps<typeof inputVariants>["variant"];
	export type InputSize = VariantProps<typeof inputVariants>["size"];

	type InputProps = WithElementRef<
		Omit<HTMLInputAttributes, "type" | "size"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined }) & {
				variant?: InputVariant;
				size?: InputSize;
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
		size = "default",
		"data-slot": dataSlot = "input",
		...restProps
	}: InputProps = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			inputVariants({ variant, size }),
			"px-3 pt-1.5",
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
			inputVariants({ variant, size }),
			"px-3 py-1",
			"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}

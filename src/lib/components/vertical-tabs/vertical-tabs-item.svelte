<script lang="ts">
	import { cn } from "@/lib/utils.js";

    import type { VerticalTabsItemProps } from "./vertical-tabs-interface";

	let { label, value, active = false, onclick, class: className }: VerticalTabsItemProps = $props();
</script>

<button
	type="button"
	class={cn(
		"w-full text-left border-r-[3px] border-t-0 border-b-0 px-4 py-2 text-sm font-medium transition-colors outline-none",
		"hover:bg-accent/50",
		active
			? "border-r-primary bg-primary text-primary-foreground hover:bg-primary"
			: "border-r-muted bg-background text-foreground hover:bg-muted/50",
		className
	)}
	{onclick}
	data-value={value}
	data-slot="vertical-tabs-item"
>
	{label ?? value}
</button>

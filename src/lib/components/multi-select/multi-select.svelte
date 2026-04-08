<script lang="ts">
    import * as Select from "@/lib/components/select";
    import { cn } from "@/lib/utils";

    import type { MultiSelectProps } from "./multi-select-interface";

    let {
        items,
        values,
        onValueChange,
        placeholder = "Select...",
        class: className,
    }: MultiSelectProps = $props();

    const selectedLabel = $derived(
        items
            .filter((item) => values.includes(item.value))
            .map((item) => item.label)
            .join(", "),
    );
</script>

<Select.Root type="multiple" value={values} {onValueChange}>
    <Select.Trigger class={cn("w-full min-w-0", className)}>
        {#if selectedLabel.length === 0}
            <span class="text-muted-foreground truncate">{placeholder}</span>
        {:else}
            <span class="truncate">{selectedLabel}</span>
        {/if}
    </Select.Trigger>
    <Select.Content>
        {#each items as item (item.value)}
            <Select.Item value={item.value} label={item.label} />
        {/each}
    </Select.Content>
</Select.Root>

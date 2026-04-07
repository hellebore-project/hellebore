<script lang="ts" generics="TColKey extends string">
    import * as Select from "@/lib/components/select";

    import type { DataTableService } from "../data-table-service.svelte";
    import type { SelectColumnItem } from "../data-table-interface";

    interface SelectCellProps {
        value: string;
        items: SelectColumnItem[];
        service: DataTableService<TColKey>;
        onValueChange: (value: string) => void;
        placeholder?: string;
    }

    const {
        value,
        items,
        service,
        onValueChange,
        placeholder = "",
    }: SelectCellProps = $props();

    let label = $derived(
        items.find((i) => i.value === value)?.label ?? placeholder,
    );
    let isPlaceholder = $derived(!items.some((i) => i.value === value));
</script>

<Select.Root
    type="single"
    {value}
    onValueChange={(v) => {
        onValueChange(v);
        service.focusGrid?.();
    }}
    onOpenChange={(open) => {
        if (!open && service.editCell !== null) service.focusGrid?.();
    }}
>
    <Select.Trigger
        size="sm"
        class="h-full w-full rounded-none border-none shadow-none"
    >
        <span class:text-muted-foreground={isPlaceholder}>{label}</span>
    </Select.Trigger>
    <Select.Content data-table-id={service.id}>
        {#each items as item (item.value)}
            <Select.Item value={item.value} label={item.label} />
        {/each}
    </Select.Content>
</Select.Root>

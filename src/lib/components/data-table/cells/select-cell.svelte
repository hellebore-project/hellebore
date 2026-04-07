<script lang="ts" generics="TColKey extends string">
    import * as Select from "@/lib/components/select";

    import type { TableService } from "../data-table-service.svelte";

    interface Props {
        value: string;
        items: { value: string; label: string }[];
        service: TableService<TColKey>;
        onValueChange: (value: string) => void;
        placeholder?: string;
    }

    const {
        value,
        items,
        service,
        onValueChange,
        placeholder = "",
    }: Props = $props();

    let contentRef: HTMLElement | null = $state(null);

    let label = $derived(
        items.find((i) => i.value === value)?.label ?? placeholder,
    );
    let isPlaceholder = $derived(!items.some((i) => i.value === value));

    $effect(() => {
        service.selectContentEl = contentRef;
        return () => {
            service.selectContentEl = null;
        };
    });
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
    <Select.Content bind:ref={contentRef}>
        {#each items as item (item.value)}
            <Select.Item value={item.value} label={item.label} />
        {/each}
    </Select.Content>
</Select.Root>

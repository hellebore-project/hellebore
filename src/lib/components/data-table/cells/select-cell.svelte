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
    let open = $state(false);
    let triggerRef = $state<HTMLButtonElement | null>(null);

    $effect(() => {
        if (!triggerRef) return;
        triggerRef.focus();
        triggerRef.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            }),
        );
    });

    $effect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            service.handleSelectCellKeyDown(e, open);
        }
        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    });
</script>

<Select.Root
    type="single"
    bind:open
    {value}
    onValueChange={(v) => {
        onValueChange(v);
        service.commitEdit();
        service.focusGrid?.();
    }}
    onOpenChange={(isOpen) => {
        if (!isOpen && service.editCell !== null) {
            service.cancelEdit();
            service.focusGrid?.();
        }
    }}
>
    <Select.Trigger
        bind:ref={triggerRef}
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

<script lang="ts" generics="TColKey extends string, TColMetaData">
    import * as Select from "@/lib/components/select";

    import type { SelectCellProps } from "../data-table-interface";

    const {
        value,
        items,
        service,
        onValueChange,
        placeholder = "",
    }: SelectCellProps<TColKey, TColMetaData> = $props();

    let label = $derived(
        items.find((i) => i.value === value)?.label ?? placeholder,
    );
    let isPlaceholder = $derived(!items.some((i) => i.value === value));
    let triggerRef = $state<HTMLButtonElement | null>(null);

    $effect(() => {
        if (!triggerRef) return;
        triggerRef.focus();
        // HACK: force open the select dropdown when the editable cell is first rendered.
        // The select component does not expose a method to programmatically open the dropdown,
        // so we simulate a space key press on the trigger button to open it.
        triggerRef.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            }),
        );
        return () => {
            service.selectOpen = false;
        };
    });
</script>

<Select.Root
    type="single"
    bind:open={service.selectOpen}
    {value}
    onValueChange={(v) => {
        onValueChange(v);
        service.commitCellEdit();
        service.focusGrid?.();
    }}
    onOpenChange={(isOpen) => {
        if (!isOpen && service.editableCellKey !== null) {
            service.cancelCellEdit();
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

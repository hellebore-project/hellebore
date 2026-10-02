<script lang="ts">
    import {
        AddRowButton,
        InsertRowAboveButton,
        InsertRowBelowButton,
        DataTable,
        DeleteRowButton,
        DataTableService,
    } from "@/lib/components/data-table";

    const {
        service,
        onAddRow,
        onInsertRowAbove,
        onInsertRowBelow,
    }: {
        service: DataTableService<any>;
        onAddRow: () => void;
        onInsertRowAbove: (rowKey: string) => void;
        onInsertRowBelow: (rowKey: string) => void;
    } = $props();
</script>

{#if service}
    {#snippet rowActions(rowKey: string)}
        <InsertRowAboveButton onclick={() => onInsertRowAbove(rowKey)} />
        <InsertRowBelowButton onclick={() => onInsertRowBelow(rowKey)} />
        <DeleteRowButton
            onclick={() => service.removeRow(rowKey)}
            deletable={true}
        />
    {/snippet}

    {#snippet placeholder()}
        <AddRowButton onclick={onAddRow} />
    {/snippet}

    <DataTable {service} {rowActions} {placeholder} />
{/if}

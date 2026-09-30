<script lang="ts">
    import {
        AddRowButton,
        InsertRowAboveButton,
        InsertRowBelowButton,
        DataTable,
        DeleteRowButton,
    } from "@/lib/components/data-table";

    import type { WordTableProps } from "./word-table-interface";

    const { service }: WordTableProps = $props();
</script>

{#if service}
    {#snippet placeholder()}
        <AddRowButton onclick={() => service.appendRow()} />
    {/snippet}

    {#snippet rowActions(rowKey: string)}
        <InsertRowAboveButton onclick={() => service.insertRowAbove(rowKey)} />
        <InsertRowBelowButton onclick={() => service.insertRowBelow(rowKey)} />
        <DeleteRowButton onclick={() => service.removeRow(rowKey)} />
    {/snippet}

    <DataTable service={service.table} {rowActions} {placeholder} />
{/if}

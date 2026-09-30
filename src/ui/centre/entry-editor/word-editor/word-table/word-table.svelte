<script lang="ts">
    import {
        AddRowButton,
        DataTable,
        DeleteRowButton,
    } from "@/lib/components/data-table";

    import type { WordTableProps } from "./word-table-interface";

    const { service }: WordTableProps = $props();
</script>

{#if service}
    {#snippet placeholder()}
        <AddRowButton onclick={() => service.addRow()} />
    {/snippet}

    {#snippet rowActions(rowKey: string)}
        <DeleteRowButton onclick={() => service.removeRow(rowKey)} />
    {/snippet}

    <DataTable service={service.table} {rowActions} {placeholder} />
{/if}

<script lang="ts">
    import {
        AddRowButton,
        DataTable,
        DeleteRowButton,
        DataTableService,
    } from "@/lib/components/data-table";

    const {
        service,
        onAddRow,
    }: {
        service: DataTableService<any>;
        onAddRow: () => void;
    } = $props();
</script>

{#if service}
    {#snippet rowActions(rowKey: string)}
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

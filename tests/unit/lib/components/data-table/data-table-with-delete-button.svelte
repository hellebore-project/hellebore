<script lang="ts">
    import {
        DataTable,
        DeleteRowButton,
        DataTableService,
    } from "@/lib/components/data-table";

    const { service }: { service: DataTableService<any> } = $props();
</script>

{#if service}
    {#snippet rowActions(rowKey: string)}
        <DeleteRowButton
            onclick={() => service.removeRow(rowKey)}
            deletable={true}
        />
    {/snippet}

    <DataTable service={service ?? null} {rowActions} />
{/if}

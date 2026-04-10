<script lang="ts">
    import { DataTable, DeleteRowButton } from "@/lib/components/data-table";

    import type { WordTableProps } from "./word-table-interface";

    const { service }: WordTableProps = $props();
</script>

{#if service}
    {#snippet rowActions(rowKey: string)}
        <DeleteRowButton
            onclick={() => service?.removeRow(rowKey)}
            deletable={rowKey !== service?.sentinelKey}
        />
    {/snippet}

    <DataTable service={service?.table ?? null} {rowActions} />
{/if}

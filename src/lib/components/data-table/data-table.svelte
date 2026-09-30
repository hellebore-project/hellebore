<script lang="ts" generics="TColKey extends string, TColMetaData">
    import * as Pagination from "@/lib/components/pagination";
    import * as Table from "@/lib/components/table";

    import { ColumnFilter } from "./column-filter";
    import DataRow from "./data-row.svelte";
    import type { DataTableProps } from "./data-table-interface";

    const {
        service,
        rowActions,
        placeholder,
    }: DataTableProps<TColKey, TColMetaData> = $props();

    let gridEl: HTMLDivElement;

    $effect(() => {
        if (!service) return;

        const s = service;
        s.focusGrid = () => gridEl?.focus();

        return () => {
            s.focusGrid = undefined;
        };
    });

    // A single window capture listener handles all keyboard events for the table.
    // Capture phase is required to catch events when a select cell's dropdown is
    // open, since bits-ui renders it in a portal outside the grid's DOM subtree.
    $effect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const isInGrid = e.composedPath().includes(gridEl);
            if (!isInGrid && !(service?.isEditingCell && service?.selectOpen))
                return;
            service?.handleKeyDown(e);
        }
        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    });
</script>

<svelte:window
    onmouseup={() => service?.endDrag()}
    onmousedown={(e) => {
        const isOutside =
            !e.composedPath().includes(gridEl) &&
            !e
                .composedPath()
                .some(
                    (el) =>
                        el instanceof HTMLElement &&
                        el.dataset.tableId === service?.id,
                );
        if (isOutside) {
            if (service?.editableCellKey) service?.commitCellEdit();
            service?.selectedCells.clear();
        }
    }}
/>

{#if service}
    <div class="flex flex-col h-full overflow-hidden">
        <div
            bind:this={gridEl}
            class="min-h-0 flex-1 overflow-y-auto focus:outline-none"
            role="grid"
            tabindex="0"
        >
            <Table.Root class="table-fixed">
                <Table.Header id={service.headerId}>
                    <Table.Row class="hover:bg-transparent">
                        {#each service.columns as col (col.key)}
                            <Table.Head>
                                {#if col.filterable}
                                    <div
                                        class="flex items-center justify-between gap-1"
                                    >
                                        <span>{col.label}</span>
                                        <ColumnFilter
                                            {service}
                                            colKey={col.key}
                                        />
                                    </div>
                                {:else}
                                    {col.label}
                                {/if}
                            </Table.Head>
                        {/each}
                        {#if rowActions}
                            <Table.Head class="w-28" />
                        {/if}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#if service.visibleRows.length === 0}
                        {#if placeholder}
                            <Table.Row>
                                <Table.Cell
                                    colspan={service.columns.length +
                                        (rowActions ? 1 : 0)}
                                    class="py-6 text-center"
                                >
                                    {@render placeholder()}
                                </Table.Cell>
                            </Table.Row>
                        {/if}
                    {:else}
                        {#each service.visibleRows as row (row.key)}
                            <DataRow {row} {service} {rowActions} />
                        {/each}
                    {/if}
                </Table.Body>
            </Table.Root>
        </div>
        <div class="flex shrink-0 justify-end border-t pt-2">
            <Pagination.Component service={service.pagination} />
        </div>
    </div>
{/if}

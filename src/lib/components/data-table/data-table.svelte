<script lang="ts" generics="TColKey extends string">
    import type { Snippet } from "svelte";

    import { Pagination } from "@/lib/components/pagination";
    import * as Table from "@/lib/components/table";

    import { ColumnFilter } from "./column-filter";
    import type { DataTableService } from "./data-table-service.svelte";
    import DataRow from "./data-row.svelte";

    interface Props {
        service: DataTableService<TColKey>;
        rowActions?: Snippet<[string]>;
    }

    const { service, rowActions }: Props = $props();

    let gridEl: HTMLDivElement;

    $effect(() => {
        const s = service;
        s.focusGrid = () => gridEl?.focus();
        return () => {
            s.focusGrid = undefined;
        };
    });
</script>

<svelte:window
    onmouseup={() => service.endDrag()}
    onmousedown={(e) => {
        const isOutside =
            !e.composedPath().includes(gridEl) &&
            !e
                .composedPath()
                .some(
                    (el) =>
                        el instanceof HTMLElement &&
                        el.dataset.tableId === service.id,
                );
        if (isOutside) {
            if (service.editCell) service.commitEdit();
            service.selectedCells.clear();
        }
    }}
/>

<div
    bind:this={gridEl}
    class="focus:outline-none"
    role="grid"
    tabindex="0"
    onkeydown={(e) => service.handleTableKeyDown(e)}
>
    <Table.Root class="table-fixed">
        <Table.Header>
            <Table.Row class="hover:bg-transparent">
                {#each service.columns as col (col.key)}
                    <Table.Head>
                        {#if col.filterable}
                            <div
                                class="flex items-center justify-between gap-1"
                            >
                                <span>{col.label}</span>
                                <ColumnFilter {service} colKey={col.key} />
                            </div>
                        {:else}
                            {col.label}
                        {/if}
                    </Table.Head>
                {/each}
                {#if rowActions}
                    <Table.Head class="w-10" />
                {/if}
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each service.visibleRows as row (row.key)}
                <DataRow {row} {service} {rowActions} />
            {/each}
        </Table.Body>
    </Table.Root>
</div>
<div class="flex shrink-0 justify-end border-t pt-2">
    <Pagination
        page={service.page}
        pageCount={service.pageCount}
        onPageChange={(p) => service.changePage(p)}
    />
</div>

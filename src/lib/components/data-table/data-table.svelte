<script lang="ts" generics="TColKey extends string">
    import type { Snippet } from "svelte";

    import * as Table from "@/lib/components/table";

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
        if (
            service.editCell &&
            !e.composedPath().includes(gridEl) &&
            !(
                service.selectContentEl &&
                e.composedPath().includes(service.selectContentEl)
            )
        )
            service.commitEdit();
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
                    <Table.Head>{col.label}</Table.Head>
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

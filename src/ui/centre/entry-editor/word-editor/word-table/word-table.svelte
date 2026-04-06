<script lang="ts">
    import * as Table from "@/lib/components/table";

    import type { WordTableProps } from "./word-table-interface";
    import { WORD_COLUMN_LABELS, WORD_COLUMNS } from "./word-table-constants";
    import WordRow from "./word-row.svelte";

    const { service }: WordTableProps = $props();

    let gridEl: HTMLDivElement;
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
                {#each WORD_COLUMNS as colKey (colKey)}
                    <Table.Head>{WORD_COLUMN_LABELS[colKey]}</Table.Head>
                {/each}
                <Table.Head class="w-10" />
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each service.visibleRows as row (row.key)}
                <WordRow {row} {service} onfocusgrid={() => gridEl.focus()} />
            {/each}
        </Table.Body>
    </Table.Root>
</div>

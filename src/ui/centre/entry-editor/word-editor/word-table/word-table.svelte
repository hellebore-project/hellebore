<script lang="ts">
    import Trash2Icon from "@lucide/svelte/icons/trash-2";

    import { cn } from "@/lib/utils";
    import { Button } from "@/lib/components/button";
    import * as Table from "@/lib/components/table";

    import type { WordTableProps } from "./word-table-interface";
    import { WORD_COLUMN_LABELS, WORD_COLUMNS } from "./word-table-constants";

    const { service }: WordTableProps = $props();

    let gridEl: HTMLDivElement;

    function focusOnMount(node: HTMLElement) {
        node.focus();
        (node as HTMLInputElement).select?.();
    }
</script>

<svelte:window onmouseup={() => service.endDrag()} />

<div
    bind:this={gridEl}
    class="focus:outline-none"
    role="grid"
    tabindex="0"
    onkeydown={(e) => service.handleTableKeyDown(e)}
>
    <Table.Root>
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
                <Table.Row class="group">
                    {#each WORD_COLUMNS as colKey (colKey)}
                        {@const posKey = `${row.key}-${colKey}`}
                        {@const isSelected = service.selectedCells.has(posKey)}
                        {@const isEditing =
                            service.editCell?.rowKey === row.key &&
                            service.editCell?.colKey === colKey}
                        <Table.Cell
                            id="word-cell-{posKey}"
                            class={cn(
                                "cursor-pointer select-none p-0",
                                isSelected && "bg-primary/10",
                                isEditing && "bg-primary/15 p-0",
                            )}
                            onmousedown={(e) =>
                                service.handleCellMouseDown(e, row.key, colKey)}
                            onmouseenter={(e) => {
                                if (e.buttons === 1)
                                    service.dragTo(row.key, colKey);
                            }}
                        >
                            {#if isEditing}
                                <input
                                    class="h-full w-full bg-transparent px-2 py-2 outline-none"
                                    type="text"
                                    value={row.cells[colKey].value}
                                    oninput={(e) =>
                                        service.setValue(
                                            row.key,
                                            colKey,
                                            e.currentTarget.value,
                                        )}
                                    onkeydown={(e) => {
                                        service.handleKeyDown(
                                            e,
                                            row.key,
                                            colKey,
                                        );
                                        if (service.editCell === null)
                                            gridEl.focus();
                                    }}
                                    onblur={() => service.commitEdit()}
                                    use:focusOnMount
                                />
                            {:else}
                                <span class="block min-h-5 px-2 py-2"
                                    >{row.cells[colKey].value}</span
                                >
                            {/if}
                        </Table.Cell>
                    {/each}
                    <Table.Cell class="w-10 p-1">
                        {#if row.key !== service.sentinelKey}
                            <Button
                                class="invisible group-hover:visible"
                                variant="ghost"
                                size="icon-sm"
                                color="destructive"
                                onclick={() => service.removeRow(row.key)}
                            >
                                <Trash2Icon />
                            </Button>
                        {/if}
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
</div>

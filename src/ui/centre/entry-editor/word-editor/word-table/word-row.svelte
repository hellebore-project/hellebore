<script lang="ts">
    import Trash2Icon from "@lucide/svelte/icons/trash-2";

    import { cn } from "@/lib/utils";
    import { Button } from "@/lib/components/button";
    import * as Table from "@/lib/components/table";

    import {
        WORD_COLUMNS,
        WORD_TYPE_ITEMS,
        WordColumnKey,
    } from "./word-table-constants";
    import type { WordRow } from "./word-table-interface";
    import type { WordTableService } from "./word-table-service.svelte";
    import { WordCellLabel, WordCellSelect, WordCellText } from "./cells";

    interface Props {
        row: WordRow;
        service: WordTableService;
        onfocusgrid: () => void;
    }

    const { row, service, onfocusgrid }: Props = $props();
</script>

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
            onmousedown={(e) => service.handleCellMouseDown(e, row.key, colKey)}
            ondblclick={() => service.handleCellDblClick(row.key, colKey)}
            onmouseenter={(e) => {
                if (e.buttons === 1) service.dragTo(row.key, colKey);
            }}
        >
            {#if colKey === WordColumnKey.WordType}
                {#if isEditing}
                    <WordCellSelect
                        rowKey={row.key}
                        wordType={row.wordType}
                        {service}
                        {onfocusgrid}
                    />
                {:else}
                    <WordCellLabel
                        value={row.key === service.sentinelKey
                            ? ""
                            : (WORD_TYPE_ITEMS.find(
                                  (i) => i.value === row.wordType,
                              )?.label ?? "")}
                    />
                {/if}
            {:else if isEditing}
                <WordCellText
                    {service}
                    rowKey={row.key}
                    {colKey}
                    value={row.cells[colKey].value}
                    {onfocusgrid}
                    selectAll={service.editSelectAll}
                />
            {:else}
                <WordCellLabel value={row.cells[colKey].value} />
            {/if}
        </Table.Cell>
    {/each}
    <Table.Cell class="w-10 p-1">
        <Button
            class={cn(
                "invisible",
                row.key !== service.sentinelKey && "group-hover:visible",
            )}
            variant="ghost"
            size="icon-sm"
            color="destructive"
            onclick={() => service.removeRow(row.key)}
        >
            <Trash2Icon />
        </Button>
    </Table.Cell>
</Table.Row>

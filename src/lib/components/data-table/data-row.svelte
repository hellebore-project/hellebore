<script lang="ts" generics="TColKey extends string">
    import type { Snippet } from "svelte";

    import { cn } from "@/lib/utils";
    import * as Table from "@/lib/components/table";

    import type { DataTableService } from "./data-table-service.svelte";
    import { ReadOnlyCell, TextCell, SelectCell } from "./cells";

    interface DataRowProps {
        row: { key: string; cells: Record<TColKey, { value: string }> };
        service: DataTableService<TColKey>;
        rowActions?: Snippet<[string]>;
    }

    const { row, service, rowActions }: DataRowProps = $props();
</script>

<Table.Row class="group">
    {#each service.columns as col (col.key)}
        {@const posKey = `${row.key}-${col.key}`}
        {@const isSelected = service.selectedCells.has(posKey)}
        {@const isEditing = service.isEditable(row.key, col.key)}
        {@const cellValue = row.cells[col.key].value}
        <Table.Cell
            id="cell-{posKey}"
            class={cn(
                "cursor-pointer select-none p-0",
                isSelected && "bg-primary/10",
                isEditing && "bg-primary/15 p-0",
            )}
            onmousedown={(e) =>
                service.handleCellMouseDown(e, row.key, col.key)}
            ondblclick={() => service.startEdit(row.key, col.key)}
            onmouseenter={(e) => {
                if (e.buttons === 1) service.dragTo(row.key, col.key);
            }}
        >
            {#if col.type === "select"}
                {@const displayValue =
                    col.items.find((i) => i.value === cellValue)?.label ?? ""}
                {#if isEditing}
                    <SelectCell
                        value={cellValue}
                        items={col.items}
                        {service}
                        onValueChange={(v) =>
                            service.setValue(row.key, col.key, v)}
                    />
                {:else}
                    <ReadOnlyCell value={displayValue} />
                {/if}
            {:else}
                {@const displayValue =
                    col.getLabel?.(row.key, cellValue) ?? cellValue}
                {#if isEditing}
                    <TextCell
                        value={cellValue}
                        oninput={(v) => service.setValue(row.key, col.key, v)}
                        selectAll={service.editSelectAll}
                    />
                {:else}
                    <ReadOnlyCell value={displayValue} />
                {/if}
            {/if}
        </Table.Cell>
    {/each}
    {#if rowActions}
        <Table.Cell class="w-10 p-1">
            {@render rowActions(row.key)}
        </Table.Cell>
    {/if}
</Table.Row>

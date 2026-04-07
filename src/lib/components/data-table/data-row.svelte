<script lang="ts" generics="TColKey extends string">
    import type { Snippet } from "svelte";

    import { cn } from "@/lib/utils";
    import * as Table from "@/lib/components/table";

    import type { TableService } from "./data-table-service.svelte";
    import LabelCell from "./cells/label-cell.svelte";
    import TextCell from "./cells/text-cell.svelte";
    import SelectCell from "./cells/select-cell.svelte";

    interface Props {
        row: { key: string; cells: Record<TColKey, { value: string }> };
        service: TableService<TColKey>;
        rowActions?: Snippet<[string]>;
    }

    const { row, service, rowActions }: Props = $props();
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
                    col.getLabel?.(row.key, cellValue) ??
                    col.items.find((i) => i.value === cellValue)?.label ??
                    ""}
                {#if isEditing}
                    <SelectCell
                        value={cellValue}
                        items={col.items}
                        {service}
                        onValueChange={(v) =>
                            service.setValue(row.key, col.key, v)}
                    />
                {:else}
                    <LabelCell value={displayValue} />
                {/if}
            {:else}
                {@const displayValue =
                    col.getLabel?.(row.key, cellValue) ?? cellValue}
                {#if isEditing}
                    <TextCell
                        rowKey={row.key}
                        colKey={col.key}
                        value={cellValue}
                        {service}
                        oninput={(v) => service.setValue(row.key, col.key, v)}
                        selectAll={service.editSelectAll}
                    />
                {:else}
                    <LabelCell value={displayValue} />
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

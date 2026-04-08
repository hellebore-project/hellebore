<script lang="ts" module>
    import type { DataTableService } from "../data-table-service.svelte";
    import type { SelectColumn } from "../data-table-interface";

    export interface ColumnSelectFilterProps<TColKey extends string = string> {
        service: DataTableService<TColKey>;
        column: SelectColumn<TColKey>;
    }
</script>

<script lang="ts" generics="TColKey extends string">
    import FilterIcon from "@lucide/svelte/icons/filter";

    import * as DropdownMenu from "@/lib/components/dropdown-menu";
    import { cn } from "@/lib/utils";

    const { service, column }: ColumnSelectFilterProps<TColKey> = $props();
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger
        class={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded",
            "hover:bg-accent hover:text-accent-foreground",
            service.isColumnFiltered(column.key) && "text-primary",
        )}
    >
        <FilterIcon class="size-3.5" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
        <DropdownMenu.Item
            inset
            disabled={!service.isColumnFiltered(column.key)}
            onSelect={() => service.clearColumnFilter(column.key)}
        >
            Select All
        </DropdownMenu.Item>
        <DropdownMenu.Item
            inset
            disabled={service.isColumnFiltered(column.key) &&
                service.getColumnFilter(column.key).length === 0}
            onSelect={() => service.setColumnFilter(column.key, [])}
        >
            Clear All
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        {#each column.items as item (item.value)}
            <DropdownMenu.CheckboxItem
                checked={service.isColumnFilterChecked(column.key, item.value)}
                closeOnSelect={false}
                onCheckedChange={() =>
                    service.toggleColumnFilter(column.key, item.value)}
            >
                {item.label}
            </DropdownMenu.CheckboxItem>
        {/each}
    </DropdownMenu.Content>
</DropdownMenu.Root>

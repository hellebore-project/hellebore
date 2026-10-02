<script
    lang="ts"
    generics="TColKey extends string, TRowMetaData = object, TColMetaData = object"
>
    import FilterIcon from "@lucide/svelte/icons/filter";

    import * as DropdownMenu from "@/lib/components/dropdown-menu";
    import { cn } from "@/lib/utils";

    import type { ColumnSelectFilterProps } from "./column-filter-interface";
    import { PredicateType } from "@/api";

    const {
        service,
        column,
    }: ColumnSelectFilterProps<TColKey, TRowMetaData, TColMetaData> = $props();
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
                service.getColumnFilter(column.key) === null}
            onSelect={() =>
                service.setColumnFilter(column.key, {
                    type: PredicateType.In,
                    values: [],
                })}
        >
            Clear All
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        {#each column.items as item (item.value)}
            <DropdownMenu.CheckboxItem
                checked={service.isSelectColumnFilterChecked(
                    column.key,
                    item.value,
                )}
                closeOnSelect={false}
                onCheckedChange={(checked) =>
                    service.toggleSelectColumnFilterOption(
                        column.key,
                        item.value,
                        checked,
                    )}
            >
                {item.label}
            </DropdownMenu.CheckboxItem>
        {/each}
    </DropdownMenu.Content>
</DropdownMenu.Root>

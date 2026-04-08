<script lang="ts" module>
    import type { DataTableService } from "../data-table-service.svelte";

    export interface ColumnTextFilterProps<TColKey extends string = string> {
        service: DataTableService<TColKey>;
        colKey: TColKey;
    }
</script>

<script lang="ts" generics="TColKey extends string">
    import FilterIcon from "@lucide/svelte/icons/filter";

    import * as Popover from "@/lib/components/popover";
    import { Input } from "@/lib/components/input";
    import { cn } from "@/lib/utils";

    const { colKey, service }: ColumnTextFilterProps<TColKey> = $props();
</script>

<Popover.Root>
    <Popover.Trigger
        class={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded",
            "hover:bg-accent hover:text-accent-foreground",
            service.isColumnFiltered(colKey) && "text-primary",
        )}
    >
        <FilterIcon class="size-3.5" />
    </Popover.Trigger>
    <Popover.Content class="w-48 p-2" align="end">
        <Input
            value={service.getTextColumnFilter(colKey)}
            placeholder="Filter..."
            oninput={(e) =>
                service.setTextColumnFilter(colKey, e.currentTarget.value)}
        />
    </Popover.Content>
</Popover.Root>

<script lang="ts" module>
    import type { DataTableService } from "../data-table-service.svelte";

    export interface ColumnFilterProps<TColKey extends string = string> {
        service: DataTableService<TColKey>;
        colKey: TColKey;
    }
</script>

<script lang="ts" generics="TColKey extends string">
    import ColumnFilterSelect from "./column-filter-select.svelte";
    import ColumnFilterText from "./column-filter-text.svelte";

    const { colKey, service }: ColumnFilterProps<TColKey> = $props();

    const column = $derived(service.findColumn(colKey));
</script>

{#if column?.type === "select"}
    <ColumnFilterSelect {service} {column} />
{:else if column?.type === "text"}
    <ColumnFilterText {service} {colKey} />
{/if}

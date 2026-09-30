<script lang="ts" generics="TColKey extends string, TColMetaData">
    import ColumnFilterSelect from "./column-filter-select.svelte";
    import ColumnFilterText from "./column-filter-text.svelte";
    import type { ColumnFilterProps } from "./column-filter-interface";

    const { colKey, service }: ColumnFilterProps<TColKey, TColMetaData> =
        $props();

    const column = $derived(service.findColumn(colKey));
</script>

{#if column?.fieldType === "select"}
    <ColumnFilterSelect {service} {column} />
{:else if column?.fieldType === "text"}
    <ColumnFilterText {service} {colKey} />
{/if}

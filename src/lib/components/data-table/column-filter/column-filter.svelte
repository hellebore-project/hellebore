<script
    lang="ts"
    generics="TColKey extends string, TRowMetaData = object, TColMetaData = object"
>
    import ColumnFilterSelect from "./column-filter-select.svelte";
    import ColumnFilterText from "./column-filter-text.svelte";
    import type { ColumnFilterProps } from "./column-filter-interface";

    const {
        colKey,
        service,
    }: ColumnFilterProps<TColKey, TRowMetaData, TColMetaData> = $props();

    const column = $derived(service.findColumn(colKey));
</script>

{#if column?.fieldType === "select"}
    <ColumnFilterSelect {service} {column} />
{:else if column?.fieldType === "text"}
    <ColumnFilterText {service} {colKey} />
{/if}

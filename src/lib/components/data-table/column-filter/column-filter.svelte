<script lang="ts" generics="TColKey extends string">
    import ColumnFilterSelect from "./column-filter-select.svelte";
    import ColumnFilterText from "./column-filter-text.svelte";
    import type { ColumnFilterProps } from "./column-filter-interface";

    const { colKey, service }: ColumnFilterProps<TColKey> = $props();

    const column = $derived(service.findColumn(colKey));
</script>

{#if column?.type === "select"}
    <ColumnFilterSelect {service} {column} />
{:else if column?.type === "text"}
    <ColumnFilterText {service} {colKey} />
{/if}

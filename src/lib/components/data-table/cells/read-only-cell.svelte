<script lang="ts">
    interface ReadOnlyCellProps {
        value: string;
    }

    const { value }: ReadOnlyCellProps = $props();
</script>

<span class="block min-h-5 px-2 py-2">{value}</span>

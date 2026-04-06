<script lang="ts">
    interface Props {
        value: string;
    }

    const { value }: Props = $props();
</script>

<span class="block min-h-5 px-2 py-2">{value}</span>

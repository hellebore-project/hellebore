<script lang="ts">
    import { EntryTitle } from "../title";
    import { PropertyTable } from "./property-table";
    import type { PropertyEditorProps } from "./property-editor-interface";

    const { service }: PropertyEditorProps = $props();
</script>

{#if service}
    <div class="flex flex-col overflow-hidden w-full h-full">
        <EntryTitle service={service?.info ?? null} />
        <div class="space-y-4">
            <PropertyTable service={service?.tableService ?? null} />
        </div>
    </div>
{/if}

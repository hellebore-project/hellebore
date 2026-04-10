<script lang="ts">
    import { EntryTitle } from "../title";
    import { WordTable } from "./word-table";
    import type { WordEditorProps } from "./word-editor-interface";

    const { service }: WordEditorProps = $props();
</script>

{#if service}
    <div class="flex h-full flex-col gap-3 overflow-hidden">
        <EntryTitle service={service?.info ?? null} />
        <div class="min-h-0 flex-1 overflow-auto">
            <WordTable service={service?.table ?? null} />
        </div>
    </div>
{/if}

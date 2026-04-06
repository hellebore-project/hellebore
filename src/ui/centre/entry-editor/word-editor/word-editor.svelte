<script lang="ts">
    import { MultiSelect } from "@/lib/components/multi-select";
    import { Pagination } from "@/lib/components/pagination";

    import { EntryTitle } from "../title";
    import { WordTable } from "./word-table";
    import type { WordEditorProps } from "./word-editor-interface";

    const { service }: WordEditorProps = $props();
</script>

<div class="flex h-full flex-col gap-3 overflow-hidden">
    <EntryTitle service={service.info} />
    <MultiSelect
        items={service.wordTypeItems}
        values={service.selectedTypeValues}
        onValueChange={(values) => service.changeFilter(values)}
        placeholder="Select word types..."
    />
    <div class="min-h-0 flex-1 overflow-auto">
        <WordTable service={service.table} />
    </div>
    <div class="flex shrink-0 justify-end border-t pt-2">
        <Pagination
            page={1}
            pageCount={1}
            onPageChange={() => {
                return;
            }}
        />
    </div>
</div>

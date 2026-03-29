<script lang="ts">
    import "./entry-editor.css";

    import TrashIcon from "@lucide/svelte/icons/trash";

    import { EntryViewType } from "@/constants";
    import { Button } from "@/lib/components/button";

    import type { EntryEditorProps } from "./entry-editor-interface";
    import { ArticleEditor } from "./article-editor";

    let { service }: EntryEditorProps = $props();
</script>

<div class="entry-editor-root grid w-full h-full">
    <div class="entry-editor-header flex items-center justify-between pb-1">
        <!-- TODO: turn this into a dynamic toolbar that changes depending on what tab is visible -->
        <Button variant="outline" size="icon-sm" color="destructive">
            <TrashIcon />
        </Button>
    </div>

    <div class="entry-editor-panel overflow-hidden px-6 pt-1">
        {#if service.currentView === EntryViewType.ArticleEditor}
            <ArticleEditor service={service.article} />
        {:else if service.currentView === EntryViewType.PropertyEditor}
            <div
                class="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-muted-foreground"
            >
                [Property Editor - Placeholder]
            </div>
        {:else if service.currentView === EntryViewType.WordEditor}
            <div
                class="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-muted-foreground"
            >
                [Word Editor - Placeholder]
            </div>
        {:else}
            {null}
        {/if}
    </div>
</div>

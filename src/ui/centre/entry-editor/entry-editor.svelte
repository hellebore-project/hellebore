<script lang="ts">
    import "./entry-editor.css";

    import { EntryViewType } from "@/constants";
	import { VerticalTabs } from "@/lib/components/vertical-tabs";

    import type { EntryEditorProps } from "./entry-editor-interface";
    import { ArticleEditor } from "./article-editor";

	let { service }: EntryEditorProps = $props();
</script>

<div class="entry-editor-root grid h-full w-full">
	<div class="entry-editor-header pb-1">
		<div class="text-sm font-medium text-muted-foreground">
			[Entry Editor Header - Placeholder]
		</div>
	</div>

    <div class="entry-editor-tabs overflow-hidden pt-1">
        <VerticalTabs
            items={service.tabData}
            activeValue={service.currentView}
            onSelect={(value) => {
                service.currentView = value as EntryViewType;
            }}
            class="h-full"
        />
    </div>

    <div class="entry-editor-panel overflow-auto px-6 pt-1">
        {#if service.currentView === EntryViewType.ArticleEditor}
            <ArticleEditor service={service.article}/>
        {:else if service.currentView === EntryViewType.PropertyEditor}
            <div class="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-muted-foreground">
                [Property Editor - Placeholder]
            </div>
        {:else if service.currentView === EntryViewType.WordEditor}
            <div class="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-muted-foreground">
                [Word Editor - Placeholder]
            </div>
        {:else}
            <div class="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-muted-foreground">
                [Unknown View - Placeholder]
            </div>
        {/if}
    </div>
</div>
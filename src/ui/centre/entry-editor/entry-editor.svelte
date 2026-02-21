<script lang="ts">
    import "./entry-editor.css";

    import { EntryViewType } from "@/constants";
	import { VerticalTabs } from "@/lib/components/vertical-tabs";

    import type { EntryEditorProps } from "./entry-editor.interface";

	let { service }: EntryEditorProps = $props();
</script>

<div class="entry-editor-root">
	<div class="entry-editor-header pbe-3">
		<div class="text-sm font-medium text-muted-foreground">
			[Entry Editor Header - Placeholder]
		</div>
	</div>

    <div class="entry-editor-tabs">
        <VerticalTabs
            items={service.tabData}
            activeValue={service.currentView}
            onSelect={(value) => {
                service.currentView = value as EntryViewType;
            }}
            class="h-full"
        />
    </div>

    <div class="entry-editor-panel overflow-auto ps-6">
        {#if service.currentView === EntryViewType.ArticleEditor}
            <div class="rounded-md border border-dashed border-muted-foreground bg-muted/20 p-4 text-muted-foreground">
                [Article Editor - Placeholder]
            </div>
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
<script lang="ts">
    import "./entry-editor.css";

    import { EntryViewType } from "@/constants";
    import * as Breadcrumb from "@/lib/components/breadcrumb";
    import { Pill } from "@/lib/components/pill";

    import type { EntryEditorProps } from "./entry-editor-interface";
    import { ArticleEditor } from "./article-editor";
    import { PropertyEditor } from "./property-editor";
    import { WordEditor } from "./word-editor";
    import { DeleteEntryButton } from "./delete-entry-button";

    let { service }: EntryEditorProps = $props();
</script>

{#if service}
<div class="entry-editor-root grid w-full h-full">
    <div class="entry-editor-header flex items-center justify-between pb-1">
        <!-- TODO: turn this into a dynamic toolbar that changes depending on what tab is visible -->
        <div>
            <Pill class="inline-block me-2" size="sm">
                {service.info.entryTypeLabel}
            </Pill>

            <Breadcrumb.Root class="inline-block">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        {service.info.title}
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item>
                        {service.currentViewLabel}
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </div>

        <DeleteEntryButton {service} />
    </div>

    <div class="entry-editor-panel overflow-hidden px-6 pt-1">
        {#if service.currentView === EntryViewType.ArticleEditor}
            <ArticleEditor service={service?.article ?? null} />
        {:else if service.currentView === EntryViewType.PropertyEditor}
            <PropertyEditor service={service?.properties ?? null} />
        {:else if service.currentView === EntryViewType.WordEditor}
            <WordEditor service={service?.lexicon ?? null} />
        {:else}
            {null}
        {/if}
    </div>
</div>
{/if}

<script lang="ts">
    import { RichTextEditor } from "@/lib/components/rich-text-editor";

    import { EntryTitle } from "../title";
    import type { ArticleEditorProps } from "./article-editor-interface";

    const { service }: ArticleEditorProps = $props();
</script>

{#if service}
    <div class="flex flex-col overflow-hidden w-full h-full">
        <EntryTitle service={service?.info ?? null} />

        <RichTextEditor
            service={service.richText}
            rootProps={{
                class: "grow w-full h-full min-h-0 p-4",
            }}
            editorProps={{
                attributes: {
                    class: "overflow-auto w-full h-full focus:outline-none",
                },
            }}
        />
    </div>
{/if}

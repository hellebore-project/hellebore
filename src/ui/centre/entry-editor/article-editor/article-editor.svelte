<script lang="ts">
    import { RichTextEditor } from "@/lib/components/rich-text-editor";

    import { EntryTitle } from "../title";
    import type { ArticleEditorProps } from "./article-editor-interface";

    const { service }: ArticleEditorProps = $props();
</script>

<div class="flex flex-col overflow-auto w-full h-full">
    <EntryTitle service={service.info} />

    <RichTextEditor
        service={service.richText}
        rootProps={{
            class: "w-full h-full p-4",
        }}
        editorProps={{
            attributes: {
                class: "w-full h-full focus:outline-none",
            },
        }}
    />
</div>

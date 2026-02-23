<script lang="ts">
    import { EntryTitle } from "../title";
    import type { ArticleEditorProps } from "./article-editor-interface";

    const { service }: ArticleEditorProps = $props();
</script>

<EntryTitle service={service.info}/>
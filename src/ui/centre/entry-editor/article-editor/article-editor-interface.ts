import type { Id } from "@/interface";

import type { ArticleEditorService } from "./article-editor-service.svelte";

export const ARTICLE_REFERENCE_PREFIX = "@";

export interface ArticleEditorProps {
    service: ArticleEditorService | null;
}

export interface EntryMentionItemData {
    id: Id;
}

import type { Id } from "@/interface";
import type { MentionItemData } from "@/lib/components/rich-text-editor/mention";

import type { ArticleEditorService } from "./article-editor-service.svelte";

export interface ArticleEditorProps {
    service: ArticleEditorService;
}

export interface EntryMentionItemData extends MentionItemData {
    id: Id;
}

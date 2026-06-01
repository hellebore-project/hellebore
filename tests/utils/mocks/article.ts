import { JSONContent } from "@tiptap/core";

import { Id } from "@/interface";

import { ARTICLE_REFERENCE_PREFIX } from "@/ui/centre/entry-editor/article-editor";

export function createDocNode(content: JSONContent[]): JSONContent {
    return { type: "doc", content };
}

export function createParagraphNode(content: JSONContent[]): JSONContent {
    return { type: "paragraph", content };
}

export function createTextNode(text: string): JSONContent {
    return { type: "text", text };
}

export function createReferenceNode(id: Id, label: string): JSONContent {
    return {
        type: "mention",
        attrs: { id, label, mentionSuggestionChar: ARTICLE_REFERENCE_PREFIX },
    };
}

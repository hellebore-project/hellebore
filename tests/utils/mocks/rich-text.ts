import { JSONContent } from "@tiptap/core";

import { Id } from "@/interface";

export function createDocNode(content: JSONContent[]): JSONContent {
    return { type: "doc", content };
}

export function createParagraphNode(content: JSONContent[]): JSONContent {
    return { type: "paragraph", content };
}

export function createTextNode(text: string): JSONContent {
    return { type: "text", text };
}

export function createReferenceNode(
    id: Id,
    label: string,
    prefix = "@",
): JSONContent {
    return {
        type: "mention",
        attrs: { id, label, mentionSuggestionChar: prefix },
    };
}

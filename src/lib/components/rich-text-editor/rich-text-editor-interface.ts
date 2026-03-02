import type { EditorProps } from "@tiptap/pm/view";
import type { BitsPrimitiveDivAttributes } from "bits-ui";

import type { RichTextEditorService } from "./rich-text-editor-service.svelte";
import type { MentionItemData } from "./mention";

export interface RichTextEditorProps<M extends MentionItemData> {
    service: RichTextEditorService<M>;
    rootProps?: BitsPrimitiveDivAttributes;
    editorProps?: EditorProps;
}

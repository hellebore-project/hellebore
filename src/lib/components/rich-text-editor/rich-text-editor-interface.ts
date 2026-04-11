import type { EditorProps } from "@tiptap/pm/view";
import type { BitsPrimitiveDivAttributes } from "bits-ui";

import type { RichTextEditorService } from "./rich-text-editor-service.svelte";

export interface RichTextEditorProps<M> {
    service: RichTextEditorService<M>;
    rootProps?: BitsPrimitiveDivAttributes;
    editorProps?: EditorProps;
}

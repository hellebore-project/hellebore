import {
    RichTextEditorProps as TiptapEditorProps,
    RichTextEditor as TiptapEditor,
} from "@mantine/tiptap";
import { Editor } from "@tiptap/react";
import { observer } from "mobx-react-lite";

import "./rich-text-editor.css";

interface RichTextEditorProps extends Partial<TiptapEditorProps> {
    getEditor: () => Editor;
}

function renderRichTextEditor({ getEditor, ...rest }: RichTextEditorProps) {
    return (
        <TiptapEditor editor={getEditor()} {...rest}>
            <TiptapEditor.Content />
        </TiptapEditor>
    );
}

export const RichTextEditor = observer(renderRichTextEditor);

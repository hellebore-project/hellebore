import {
    RichTextEditorProps,
    RichTextEditor as TiptapEditor,
} from "@mantine/tiptap";
import { Editor } from "@tiptap/react";
import { observer } from "mobx-react-lite";

import "./rich-text-editor.css";

interface RichTextEditorSettings extends Partial<RichTextEditorProps> {
    getEditor: () => Editor;
}

function renderRichTextEditor({ getEditor, ...rest }: RichTextEditorSettings) {
    return (
        <TiptapEditor editor={getEditor()} {...rest}>
            <TiptapEditor.Content />
        </TiptapEditor>
    );
}

const RichTextEditor = observer(renderRichTextEditor);

export default RichTextEditor;

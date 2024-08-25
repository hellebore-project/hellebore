import { RichTextEditor as TiptapEditor } from "@mantine/tiptap";
import { Editor } from "@tiptap/react";
import { observer } from "mobx-react-lite";

import "./rich-text-editor.css";

interface RichTextEditorSettings {
    getEditor: () => Editor;
}

function renderRichTextEditor({ getEditor }: RichTextEditorSettings) {
    return (
        <TiptapEditor editor={getEditor()}>
            <TiptapEditor.Content />
        </TiptapEditor>
    );
}

const RichTextEditor = observer(renderRichTextEditor);

export default RichTextEditor;

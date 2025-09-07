import "./article-editor.css";

import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { SPACE } from "@/shared/common";
import { RichTextEditor } from "@/shared/rich-text-editor";
import { TitleField } from "../title-field";

const RICH_TEXT_EDITOR_STYLES = {
    root: { borderWidth: "0" },
    content: { backgroundColor: "var(--default-bg-color)" },
};

function renderArticleEditor() {
    const service = getService();
    return (
        <Container className="article-editor">
            <Stack
                className="article-editor-stack"
                justify="flex-start"
                gap={0}
            >
                <TitleField />

                {SPACE}

                <RichTextEditor
                    className="article-editor-text"
                    getEditor={() => service.view.entityEditor.text.editor}
                    styles={RICH_TEXT_EDITOR_STYLES}
                />
            </Stack>
        </Container>
    );
}

export const ArticleEditor = observer(renderArticleEditor);

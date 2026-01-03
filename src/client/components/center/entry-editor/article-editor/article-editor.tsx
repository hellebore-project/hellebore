import "./article-editor.css";

import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { SPACE } from "@/shared/common";
import { RichTextEditor } from "@/shared/rich-text-editor";

import { TitleField } from "../title-field";
import { ArticleEditorService } from "./article-editor.service";

const RICH_TEXT_EDITOR_STYLES = {
    root: { borderWidth: "0" },
    content: { backgroundColor: "var(--default-bg-color)" },
};

interface ArticleEditorProps {
    service: ArticleEditorService;
}

function renderArticleEditor({ service }: ArticleEditorProps) {
    return (
        <Container className="article-editor">
            <Stack
                className="article-editor-stack"
                justify="flex-start"
                gap={0}
            >
                <TitleField service={service.info} />

                {SPACE}

                <RichTextEditor
                    className="article-editor-text"
                    getEditor={() => service.editor}
                    styles={RICH_TEXT_EDITOR_STYLES}
                />
            </Stack>
        </Container>
    );
}

export const ArticleEditor = observer(renderArticleEditor);

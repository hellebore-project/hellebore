import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { DIVIDER, SPACE } from "@/shared/common";
import { FieldTable } from "@/shared/field-table";
import { RichTextEditor } from "@/shared/rich-text-editor/rich-text-editor";
import { TextField } from "@/shared/text-field";
import { CENTER_BG_COLOR } from "@/constants";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };
const RICH_TEXT_EDITOR_STYLES = {
    root: { borderWidth: "0" },
    content: { backgroundColor: CENTER_BG_COLOR },
};

function renderArticleEditor() {
    const service = getService();
    return (
        <Container>
            <form>
                <TextField
                    variant="unstyled"
                    mx="12"
                    styles={TITLE_FIELD_STYLES}
                    placeholder="Title"
                    getValue={() => service.view.entityEditor.title}
                    getError={() => {
                        if (service.view.entityEditor.title == "")
                            return "Empty title";
                        if (!service.view.entityEditor.info.isTitleUnique)
                            return "Duplicate title";
                        return null;
                    }}
                    onChange={(event) =>
                        (service.view.entityEditor.title =
                            event.currentTarget.value)
                    }
                />
                {DIVIDER}

                <FieldTable
                    getData={() => service.view.entityEditor.fieldData}
                    bg={CENTER_BG_COLOR}
                    bd="0.5px solid var(--mantine-color-dark-4)"
                    stack={{ mx: "15" }}
                />

                {SPACE}

                <RichTextEditor
                    getEditor={() => service.view.entityEditor.body.editor}
                    styles={RICH_TEXT_EDITOR_STYLES}
                />
            </form>
        </Container>
    );
}

export const ArticleEditor = observer(renderArticleEditor);

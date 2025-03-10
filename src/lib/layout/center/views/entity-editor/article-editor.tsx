import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { SPACE } from "@/shared/common";
import { RichTextEditor } from "@/shared/rich-text-editor/rich-text-editor";
import { CENTER_BG_COLOR } from "@/constants";
import { PropertyTable } from "./property-table";
import { TitleField } from "./title-field";

const RICH_TEXT_EDITOR_STYLES = {
    root: { borderWidth: "0" },
    content: { backgroundColor: CENTER_BG_COLOR },
};

function renderArticleEditor() {
    const service = getService();
    return (
        <Container>
            <form>
                <TitleField />

                <PropertyTable
                    getData={() => service.view.entityEditor.fieldData}
                    bg={CENTER_BG_COLOR}
                    bd="0.5px solid var(--mantine-color-dark-4)"
                    stack={{ mx: "15" }}
                />

                {SPACE}

                <RichTextEditor
                    getEditor={() =>
                        service.view.entityEditor.articleText.editor
                    }
                    styles={RICH_TEXT_EDITOR_STYLES}
                />
            </form>
        </Container>
    );
}

export const ArticleEditor = observer(renderArticleEditor);

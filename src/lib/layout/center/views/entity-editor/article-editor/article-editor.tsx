import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { SPACE } from "@/shared/common";
import { RichTextEditor } from "@/shared/rich-text-editor/rich-text-editor";
import { CENTER_BG_COLOR } from "@/constants";
import { TitleField } from "../title-field";
import { PropertyTable } from "./property-table";

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

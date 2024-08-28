import { Container, Space } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "../services";
import TextField from "../shared/text-field";
import RichTextEditor from "../shared/rich-text-editor/rich-text-editor";
import FieldTable from "../shared/field-table";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

function renderArticleEditor() {
    const service = getService();
    return (
        <Container>
            <form>
                <TextField
                    variant="unstyled"
                    placeholder="Enter a unique title"
                    getValue={() => service.view.articleEditor.title}
                    getError={() => {
                        if (service.view.articleEditor.title == "")
                            return "Empty title";
                        if (!service.view.articleEditor.isTitleUnique)
                            return "Duplicate title";
                        return null;
                    }}
                    onChange={(event) =>
                        service.view.articleEditor.setTitle(
                            event.currentTarget.value,
                        )
                    }
                    styles={TITLE_FIELD_STYLES}
                />
                <Space h="lg" />
                <FieldTable
                    getData={() => service.view.articleEditor.fieldData}
                />
                <Space h="lg" />
                <RichTextEditor
                    getEditor={() => service.view.articleEditor.body.editor}
                />
            </form>
        </Container>
    );
}

const ArticleEditor = observer(renderArticleEditor);

export default ArticleEditor;

import { Container, Divider, Space, Text } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "../services";
import TextField from "../shared/text-field";
import RichTextEditor from "../shared/rich-text-editor/rich-text-editor";
import FieldTable from "../shared/field-table";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };
const RICH_TEXT_EDITOR_STYLES = { root: { borderWidth: "0" } };

function renderArticleEditor() {
    const service = getService();
    return (
        <Container>
            <form>
                <Text size="sm" fw={700} mx="12">
                    {service.view.articleEditor.info.entityTypeLabel}
                </Text>
                <Divider my="sm" />
                <Space h="lg" />
                <TextField
                    variant="unstyled"
                    mx="12"
                    placeholder="Title"
                    getValue={() => service.view.articleEditor.info.title}
                    getError={() => {
                        if (service.view.articleEditor.info.title == "")
                            return "Empty title";
                        if (!service.view.articleEditor.info.isTitleUnique)
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
                    mx="15"
                    getData={() => service.view.articleEditor.fieldData}
                />
                <Space h="lg" />
                <RichTextEditor
                    getEditor={() => service.view.articleEditor.body.editor}
                    styles={RICH_TEXT_EDITOR_STYLES}
                />
            </form>
        </Container>
    );
}

const ArticleEditor = observer(renderArticleEditor);

export default ArticleEditor;

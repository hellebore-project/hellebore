import { Container, Space } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "../services";
import TextField from "../shared/text-field";
import RichTextEditor from "../shared/rich-text-editor/rich-text-editor";

function renderArticleEditor() {
    const service = getService();
    const getError = () => {
        if (service.view.articleEditor.title == "") return "Empty title";
        if (!service.view.articleEditor.isTitleUnique) return "Duplicate title";
        return null;
    };
    return (
        <Container>
            <form>
                <TextField
                    variant="unstyled"
                    placeholder="Enter a unique title"
                    getValue={() => service.view.articleEditor.title}
                    getError={getError}
                    onChange={(event) =>
                        service.view.articleEditor.setTitle(
                            event.currentTarget.value,
                        )
                    }
                    styles={{ input: { fontSize: 34, paddingBottom: 10 } }}
                />
                <Space h="lg" />
                <RichTextEditor
                    getEditor={() => service.view.articleEditor.editor}
                />
            </form>
        </Container>
    );
}

const ArticleEditor = observer(renderArticleEditor);

export default ArticleEditor;

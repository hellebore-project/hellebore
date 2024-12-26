import { Badge, Card, Container, Divider, Grid, Space } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { TextField } from "@/shared/text-field";
import { RichTextEditor } from "@/shared/rich-text-editor/rich-text-editor";
import { FieldTable } from "@/shared/field-table";
import { DeleteArticleButton } from "./delete-article-button";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };
const RICH_TEXT_EDITOR_STYLES = { root: { borderWidth: "0" } };

const SPACE = <Space h="lg" />;

function renderArticleEditor() {
    const service = getService();
    return (
        <Container>
            <form>
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
                <Divider my="sm" />

                <Grid align="center" mx="12">
                    <Grid.Col span="content">
                        <Badge variant="outline" color="blue">
                            {service.view.articleEditor.info.entityTypeLabel}
                        </Badge>
                    </Grid.Col>
                    <Grid.Col span="content" style={{ marginLeft: "auto" }}>
                        <DeleteArticleButton />
                    </Grid.Col>
                </Grid>

                {SPACE}

                <FieldTable
                    mx="15"
                    getData={() => service.view.articleEditor.fieldData}
                />

                {SPACE}

                <RichTextEditor
                    getEditor={() => service.view.articleEditor.body.editor}
                    styles={RICH_TEXT_EDITOR_STYLES}
                />
            </form>
        </Container>
    );
}

export const ArticleEditor = observer(renderArticleEditor);

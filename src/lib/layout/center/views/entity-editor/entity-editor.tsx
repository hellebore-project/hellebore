import "./entity-editor.css";

import { EntityType, EntityViewKey } from "@/interface";
import { getService } from "@/services";
import { Badge, Grid, Group, Space, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import {
    TableOfContents,
    TableOfContentsItemData,
} from "@/shared/table-of-contents";
import { ArticleEditor } from "./article-editor";
import { DeleteEntityButton } from "./delete-entity-button";
import { WordEditor } from "./word-editor/word-editor";

const ARTICLE_TAB_DATA: TableOfContentsItemData = {
    label: "Article",
    value: EntityViewKey.ArticleEditor,
    rank: 1,
    onClick: () => {
        const service = getService();
        service.view.openArticleEditor(service.view.entityEditor.info.id);
    },
};

const LEXICON_TAB_DATA: TableOfContentsItemData = {
    label: "Lexicon",
    value: EntityViewKey.WordEditor,
    rank: 1,
    onClick: () => {
        const service = getService();
        service.view.openWordEditor(service.view.entityEditor.info.id);
    },
};

function renderEntityEditorHeader() {
    const service = getService();
    return (
        <Group className="entity-editor-header">
            <Badge variant="outline" color="blue">
                {service.view.entityEditor.info.entityTypeLabel}
            </Badge>
            <div className="grow" />
            <DeleteEntityButton />
        </Group>
    );
}

const EntityEditorHeader = observer(renderEntityEditorHeader);

function renderEntityEditorContent() {
    const service = getService();
    const viewKey = service.view.entityEditor.currentView;
    if (viewKey === EntityViewKey.ArticleEditor) return <ArticleEditor />;
    if (viewKey === EntityViewKey.WordEditor) return <WordEditor />;
    return null;
}

const EntityEditorContent = observer(renderEntityEditorContent);

function renderEntityEditorTabs() {
    const service = getService();
    const entityType = service.view.entityType;

    let tabData: TableOfContentsItemData[] = [];
    if (entityType === EntityType.LANGUAGE)
        tabData = [ARTICLE_TAB_DATA, LEXICON_TAB_DATA];

    if (tabData.length == 0) return null;

    const activeTabKey = service.view.entityEditor.currentView;

    return (
        <TableOfContents
            className="entity-editor-toc"
            data={tabData}
            activeValue={activeTabKey}
            itemSettings={{
                className: "entity-editor-toc-item",
                justify: "space-between",
            }}
        />
    );
}

export const EntityEditorTabs = observer(renderEntityEditorTabs);

function renderEntityEditor() {
    return (
        <Stack className="entity-editor" gap={0}>
            <EntityEditorHeader />
            <Space className="entity-editor-space-below-header" />
            <Stack className="entity-editor-stack">
                <Grid className="entity-editor-grid">
                    <Grid.Col span={1}>
                        <EntityEditorTabs />
                    </Grid.Col>
                    <Grid.Col span={10}>
                        <EntityEditorContent />
                    </Grid.Col>
                </Grid>
            </Stack>
        </Stack>
    );
}

export const EntityEditor = observer(renderEntityEditor);

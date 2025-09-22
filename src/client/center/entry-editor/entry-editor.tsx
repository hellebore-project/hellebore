import "./entry-editor.css";

import { Badge, Grid, Group, Space, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntityType } from "@/domain";
import { EntryViewKey, getService } from "@/client";
import {
    TableOfContents,
    TableOfContentsItemData,
} from "@/shared/table-of-contents";

import { PropertyEditor } from "./property-editor";
import { WordEditor } from "./word-editor/word-editor";
import { DeleteEntryButton } from "./delete-entry-button";
import { ArticleEditor } from "./article-editor";

const ARTICLE_TAB_DATA: TableOfContentsItemData = {
    label: "Article",
    value: EntryViewKey.ArticleEditor,
    rank: 1,
    onClick: () => {
        const service = getService();
        service.openArticleEditor(service.entryEditor.info.id);
    },
};

const PROPERTY_TAB_DATA: TableOfContentsItemData = {
    label: "Properties",
    value: EntryViewKey.PropertyEditor,
    rank: 1,
    onClick: () => {
        const service = getService();
        service.openPropertyEditor(service.entryEditor.info.id);
    },
};

const LEXICON_TAB_DATA: TableOfContentsItemData = {
    label: "Lexicon",
    value: EntryViewKey.WordEditor,
    rank: 1,
    onClick: () => {
        const service = getService();
        service.openWordEditor(service.entryEditor.info.id);
    },
};

function renderEntityEditorHeader() {
    const service = getService();
    return (
        <Group className="entry-editor-header">
            <Badge variant="outline" color="blue">
                {service.entryEditor.info.entityTypeLabel}
            </Badge>
            <div className="grow" />
            <DeleteEntryButton />
        </Group>
    );
}

const EntityEditorHeader = observer(renderEntityEditorHeader);

function renderEntityEditorContent() {
    const service = getService();
    const viewKey = service.entryEditor.currentView;
    if (viewKey === EntryViewKey.ArticleEditor) return <ArticleEditor />;
    if (viewKey === EntryViewKey.PropertyEditor) return <PropertyEditor />;
    if (viewKey === EntryViewKey.WordEditor) return <WordEditor />;
    return null;
}

const EntityEditorContent = observer(renderEntityEditorContent);

function renderEntityEditorTabs() {
    const service = getService();
    const entityType = service.entityType;

    const tabData: TableOfContentsItemData[] = [
        ARTICLE_TAB_DATA,
        PROPERTY_TAB_DATA,
    ];
    if (entityType === EntityType.LANGUAGE) tabData.push(LEXICON_TAB_DATA);

    const activeTabKey = service.entryEditor.currentView;

    return (
        <TableOfContents
            className="entry-editor-toc"
            data={tabData}
            activeValue={activeTabKey}
            itemSettings={{
                className: "entry-editor-toc-item",
                justify: "space-between",
            }}
        />
    );
}

export const EntityEditorTabs = observer(renderEntityEditorTabs);

function renderEntryEditor() {
    return (
        <Stack className="entry-editor" gap={0}>
            <EntityEditorHeader />
            <Space className="entry-editor-space-below-header" />
            <Stack className="entry-editor-stack">
                <Grid className="entry-editor-grid">
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

export const EntryEditor = observer(renderEntryEditor);

import "./entry-editor.css";

import { Badge, Grid, Group, Space, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntryEditorService, EntryViewType } from "@/client";
import { EntityType } from "@/domain";
import {
    TableOfContents,
    TableOfContentsItemData,
} from "@/shared/table-of-contents";

import { PropertyEditor } from "./property-editor";
import { WordEditor } from "./word-editor/word-editor";
import { DeleteEntryButton } from "./delete-entry-button";
import { ArticleEditor } from "./article-editor";

interface EntryEditorProps {
    service: EntryEditorService;
}

function renderEntryEditorHeader({ service }: EntryEditorProps) {
    return (
        <Group className="entry-editor-header">
            <Badge variant="outline" color="blue">
                {service.info.entityTypeLabel}
            </Badge>
            <div className="grow" />
            <DeleteEntryButton service={service} />
        </Group>
    );
}

const EntryEditorHeader = observer(renderEntryEditorHeader);

function renderEntryEditorContent({ service }: EntryEditorProps) {
    const viewKey = service.currentView;
    if (viewKey === EntryViewType.ArticleEditor)
        return <ArticleEditor service={service.article} />;
    if (viewKey === EntryViewType.PropertyEditor)
        return <PropertyEditor service={service.properties} />;
    if (viewKey === EntryViewType.WordEditor)
        return <WordEditor service={service.lexicon} />;
    return null;
}

const EntryEditorContent = observer(renderEntryEditorContent);

function renderEntryEditorTabs({ service }: EntryEditorProps) {
    const entryType = service.entryType;

    const tabData: TableOfContentsItemData[] = [
        service.tabData.get(
            EntryViewType.ArticleEditor,
        ) as TableOfContentsItemData,
        service.tabData.get(
            EntryViewType.PropertyEditor,
        ) as TableOfContentsItemData,
    ];
    if (entryType === EntityType.LANGUAGE)
        tabData.push(
            service.tabData.get(
                EntryViewType.WordEditor,
            ) as TableOfContentsItemData,
        );

    const activeTabKey = service.currentView;

    return (
        <TableOfContents
            className="entry-editor-toc"
            data={tabData}
            activeValue={activeTabKey}
            itemProps={{
                className: "entry-editor-toc-item",
                justify: "space-between",
            }}
        />
    );
}

export const EntryEditorTabs = observer(renderEntryEditorTabs);

function renderEntryEditor(props: EntryEditorProps) {
    return (
        <Stack className="entry-editor" gap={0}>
            <EntryEditorHeader {...props} />
            <Space className="entry-editor-space-below-header" />
            <Stack className="entry-editor-stack">
                <Grid className="entry-editor-grid">
                    <Grid.Col span={1}>
                        <EntryEditorTabs {...props} />
                    </Grid.Col>
                    <Grid.Col span={10}>
                        <EntryEditorContent {...props} />
                    </Grid.Col>
                </Grid>
            </Stack>
        </Stack>
    );
}

export const EntryEditor = observer(renderEntryEditor);

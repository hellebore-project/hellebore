import { EntityType, EntityViewKey } from "@/interface";
import { getService } from "@/services";
import { Badge, Box, Grid, Tabs } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";

import { SPACE } from "@/shared/common";
import { ArticleEditor } from "./article-editor";
import { DeleteEntityButton } from "./delete-entity-button";
import { CENTER_BG_COLOR } from "@/constants";
import { WordEditor } from "./word-editor";

function renderEntityEditorHeader() {
    const service = getService();
    return (
        <Grid align="center" mx="12">
            <Grid.Col span="content">
                <Badge variant="outline" color="blue">
                    {service.view.entityEditor.info.entityTypeLabel}
                </Badge>
            </Grid.Col>
            <Grid.Col span="content" style={{ marginLeft: "auto" }}>
                <DeleteEntityButton />
            </Grid.Col>
        </Grid>
    );
}

const EntityEditorHeader = observer(renderEntityEditorHeader);

const OVERVIEW_TAB_KEY = "overview";
const LEXICON_TAB_KEY = "lexicon";

const VIEW_TAB_MAPPING: { [key in EntityViewKey]?: string } = {
    [EntityViewKey.ARTICLE_EDITOR]: OVERVIEW_TAB_KEY,
    [EntityViewKey.WORD_EDITOR]: LEXICON_TAB_KEY,
};

function renderOverviewTab() {
    const service = getService();
    return (
        <Tabs.Tab
            value={OVERVIEW_TAB_KEY}
            onClick={() =>
                service.view.openArticleEditor(
                    service.view.entityEditor.info.id,
                )
            }
        >
            Overview
        </Tabs.Tab>
    );
}

const OverviewTab = observer(renderOverviewTab);

function renderLexiconTab() {
    const service = getService();
    return (
        <Tabs.Tab
            value={LEXICON_TAB_KEY}
            onClick={() =>
                service.view.openWordEditor(service.view.entityEditor.info.id)
            }
        >
            Lexicon
        </Tabs.Tab>
    );
}

const LexiconTab = observer(renderLexiconTab);

function renderEntityEditorContent() {
    const service = getService();
    const viewKey = service.view.entityEditor.currentView;
    if (viewKey === EntityViewKey.ARTICLE_EDITOR) return <ArticleEditor />;
    if (viewKey === EntityViewKey.WORD_EDITOR) return <WordEditor />;
    return null;
}

const EntityEditorContent = observer(renderEntityEditorContent);

function renderEntityEditorTabs({ children }: PropsWithChildren) {
    const service = getService();
    const entityType = service.view.entityType;

    let tabs: ReactElement[] = [];
    if (entityType === EntityType.LANGUAGE)
        tabs = [
            <OverviewTab key={OVERVIEW_TAB_KEY} />,
            <LexiconTab key={LEXICON_TAB_KEY} />,
        ];

    if (tabs.length == 0) return children;

    const activeTabKey =
        VIEW_TAB_MAPPING?.[service.view.entityEditor.currentView] ?? null;
    if (activeTabKey == null) return null;

    return (
        <Tabs value={activeTabKey} orientation="vertical">
            <Tabs.List>{tabs}</Tabs.List>
            <Tabs.Panel value={activeTabKey}>{children}</Tabs.Panel>
        </Tabs>
    );
}

export const EntityEditorTabs = observer(renderEntityEditorTabs);

function renderEntityEditor() {
    return (
        <Box bg={CENTER_BG_COLOR}>
            <EntityEditorHeader />
            {SPACE}
            <EntityEditorTabs>
                <EntityEditorContent />
            </EntityEditorTabs>
        </Box>
    );
}

export const EntityEditor = observer(renderEntityEditor);

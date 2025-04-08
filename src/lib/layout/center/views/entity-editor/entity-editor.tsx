import { EntityType, EntityViewKey } from "@/interface";
import { getService } from "@/services";
import { Badge, Box, Container, Flex, Grid, Stack, Tabs } from "@mantine/core";
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
    [EntityViewKey.ArticleEditor]: OVERVIEW_TAB_KEY,
    [EntityViewKey.WordEditor]: LEXICON_TAB_KEY,
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
    if (viewKey === EntityViewKey.ArticleEditor) return <ArticleEditor />;
    if (viewKey === EntityViewKey.WordEditor) return <WordEditor />;
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
        <Grid
            display="flex"
            h="100%"
            w="100%"
            style={{ flexDirection: "row", flexGrow: 1 }}
        >
            <Grid.Col>{children}</Grid.Col>
        </Grid>
    );
}

export const EntityEditorTabs = observer(renderEntityEditorTabs);

function renderEntityEditor() {
    return (
        <Stack h="100%" w="100%" bg={CENTER_BG_COLOR} style={{ flexGrow: 1 }}>
            <EntityEditorHeader />
            {SPACE}
            <Stack
                h="100%"
                w="100%"
                bg={CENTER_BG_COLOR}
                style={{ flexGrow: 1 }}
            >
                <EntityEditorTabs>
                    <EntityEditorContent />
                </EntityEditorTabs>
            </Stack>
        </Stack>
    );
}

export const EntityEditor = observer(renderEntityEditor);

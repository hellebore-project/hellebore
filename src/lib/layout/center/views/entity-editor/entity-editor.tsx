import { EntityType, ViewKey } from "@/interface";
import { getService } from "@/services";
import { Badge, Box, Grid, Tabs } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement } from "react";

import { SPACE } from "@/shared/common";
import { ArticleEditor } from "./article-editor";
import { DeleteEntityButton } from "./delete-entity-button";
import { CENTER_BG_COLOR } from "@/constants";

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

const VIEW_TAB_MAPPING: { [key in ViewKey]?: string } = {
    [ViewKey.ARTICLE_EDITOR]: OVERVIEW_TAB_KEY,
    [ViewKey.DICTIONARY_EDITOR]: LEXICON_TAB_KEY,
};

const OVERVIEW_TAB = (
    <Tabs.Tab key={OVERVIEW_TAB_KEY} value={OVERVIEW_TAB_KEY}>
        Overview
    </Tabs.Tab>
);
const LEXICON_TAB = (
    <Tabs.Tab key={LEXICON_TAB_KEY} value={LEXICON_TAB_KEY}>
        Lexicon
    </Tabs.Tab>
);

function renderEntityEditorContent() {
    const service = getService();
    const viewKey = service.view.viewKey;
    if (viewKey === ViewKey.ARTICLE_EDITOR) return <ArticleEditor />;
    if (viewKey === ViewKey.DICTIONARY_EDITOR) return null; // TODO
    return null;
}

const EntityEditorContent = observer(renderEntityEditorContent);

function renderEntityEditorTabs({ children }: PropsWithChildren) {
    const service = getService();
    const entityType = service.view.entityType;

    let tabs: ReactElement[] = [];
    if (entityType === EntityType.LANGUAGE) tabs = [OVERVIEW_TAB, LEXICON_TAB];

    if (tabs.length == 0) return children;

    const activeTabKey = VIEW_TAB_MAPPING?.[service.view.viewKey] ?? null;
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

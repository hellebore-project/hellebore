import { expect } from "vitest";

import { EntryViewType } from "@/constants";
import { CommandNames } from "@/api";

import { test } from "./fixtures";

test("opening the same entry twice reuses the loaded panel", async ({
    centralPanelManager,
    entryId,
    mockedInvoker,
    mockedEntryArticle,
    mockedSearchedEntries,
}) => {
    const firstService = await centralPanelManager.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    const secondService = await centralPanelManager.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    expect(secondService).toBe(firstService);
    expect(firstService.isArticleEditorOpen).toBe(true);
    expect(firstService.article.loaded).toBe(true);

    const articleLoads = mockedInvoker.spy.mock.calls.filter(
        ([name]) => name === CommandNames.Entry.GetArticle,
    );
    expect(articleLoads).toHaveLength(1);
});

test("switching entry views loads the requested editor once", async ({
    centralPanelManager,
    entryId,
    mockedInvoker,
    mockedEntryInfo,
    mockedEntryArticle,
    mockedSearchedEntries,
    mockedEntryProperties,
}) => {
    const service = await centralPanelManager.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    await centralPanelManager.changeEntryEditorView(
        service.id,
        EntryViewType.PropertyEditor,
    );

    expect(service.isPropertyEditorOpen).toBe(true);
    expect(service.properties.entity).not.toBeNull();
    expect(service.properties.entity).toMatchObject({
        name: "Dante",
    });

    const propertyLoads = mockedInvoker.spy.mock.calls.filter(
        ([name]) => name === CommandNames.Entry.GetProperties,
    );
    expect(propertyLoads).toHaveLength(1);

    const reopenedService = await centralPanelManager.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    expect(reopenedService).toBe(service);
    expect(reopenedService.currentView).toBe(EntryViewType.PropertyEditor);
});

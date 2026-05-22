import { waitFor } from "@testing-library/svelte";
import { expect } from "vitest";

import { CommandNames, EntryViewType } from "@/constants";
import type { EntryPropertyResponse } from "@/interface";
import {
    mockGetEntryArticle,
    mockGetEntryProperties,
} from "@tests/utils/mocks";

import { test } from "./fixtures";

test("opening the same entry twice reuses the loaded panel", async ({
    clientManager,
    entryId,
    mockedEntryInfo,
    entryArticle,
    mockedInvoker,
}) => {
    mockGetEntryArticle(mockedInvoker, {
        info: mockedEntryInfo,
        text: entryArticle,
    });

    const firstService = await clientManager.central.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    const secondService = await clientManager.central.openEntryEditor({
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
    clientManager,
    entryId,
    mockedEntryInfo,
    entryArticle,
    mockedInvoker,
}) => {
    mockGetEntryArticle(mockedInvoker, {
        info: mockedEntryInfo,
        text: entryArticle,
    });
    mockGetEntryProperties(mockedInvoker, {
        info: mockedEntryInfo,
        properties: { name: "mocked-property-name" },
    } as EntryPropertyResponse);

    const service = await clientManager.central.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    clientManager.central.changeEntryEditorView(
        service.id,
        EntryViewType.PropertyEditor,
    );

    await waitFor(() => {
        expect(service.currentView).toBe(EntryViewType.PropertyEditor);
    });

    expect(service.isPropertyEditorOpen).toBe(true);
    expect(service.properties.entity).not.toBeNull();
    expect(service.properties.entity).toMatchObject({
        name: "mocked-property-name",
    });

    const propertyLoads = mockedInvoker.spy.mock.calls.filter(
        ([name]) => name === CommandNames.Entry.GetProperties,
    );
    expect(propertyLoads).toHaveLength(1);

    const reopenedService = await clientManager.central.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.ArticleEditor,
    });

    expect(reopenedService).toBe(service);
    expect(reopenedService.currentView).toBe(EntryViewType.PropertyEditor);
});

import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { EntryType } from "@/api";
import { EntryViewType } from "@/constants";
import { EntryEditorNavigator } from "@/ui/left-sidebar";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("entry-editor-navigator is a singleton", async ({
    leftSidebarService,
}) => {
    leftSidebarService.removeAllSections();

    const first = leftSidebarService.addEntryEditorNavigator({
        ownerId: "panel-1",
        entry: { id: "entry1", type: EntryType.Person, title: "first-title" },
        activeView: EntryViewType.ArticleEditor,
    });

    const second = leftSidebarService.addEntryEditorNavigator({
        ownerId: "panel-2",
        entry: {
            id: "entry2",
            type: EntryType.Language,
            title: "second-title",
        },
        activeView: EntryViewType.PropertyEditor,
    });

    expect(second).toBe(first);
    expect(first.entryId).toBe("entry2");
    expect(first.entryType).toBe(EntryType.Language);
    expect(first.title).toBe("second-title");
    expect(first.activeView).toBe(EntryViewType.PropertyEditor);
    expect([...leftSidebarService.iterateSections()]).toHaveLength(1);
});

test("emit event on selecting an option", async ({
    user,
    clientManager,
    entryEditorNavigatorService,
}) => {
    const onSelect = vi.fn();
    entryEditorNavigatorService.onSelectItem.subscribe(onSelect);

    render(EntryEditorNavigator, {
        props: { service: entryEditorNavigatorService },
    });

    const option = screen.getByText("Properties");
    await user.click(option);

    expect(onSelect).toHaveBeenCalledWith({
        panelId: clientManager.id,
        type: EntryViewType.PropertyEditor,
    });
});

test.extend({
    entryType: EntryType.Language,
})("language options", async ({ entryEditorNavigatorService }) => {
    render(EntryEditorNavigator, {
        props: { service: entryEditorNavigatorService },
    });
    expect(screen.getByText("Article")).toBeTruthy();
    expect(screen.getByText("Properties")).toBeTruthy();
    expect(screen.getByText("Lexicon")).toBeTruthy();
});

test.extend({
    entryType: EntryType.Person,
})("person options", async ({ entryEditorNavigatorService }) => {
    render(EntryEditorNavigator, {
        props: { service: entryEditorNavigatorService },
    });
    expect(screen.getByText("Article")).toBeTruthy();
    expect(screen.getByText("Properties")).toBeTruthy();
    expect(screen.queryByText("Lexicon")).toBeFalsy();
});

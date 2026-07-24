import { expect, vi } from "vitest";

import { EntryType } from "@/api";
import { EntryViewType, SidebarSectionType } from "@/constants";
import { EntryEditorNavigatorService, LeftSidebar } from "@/ui/left-sidebar";
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

test("emit event on selecting an item", async ({
    clientManager,
    leftSidebarService,
    entryEditorNavigatorService,
}) => {
    const onSelect = vi.fn();
    leftSidebarService.onSelectEntryEditorNavItem.subscribe(onSelect);

    entryEditorNavigatorService.selectView(EntryViewType.WordEditor);

    expect(onSelect).toHaveBeenCalledWith({
        panelId: clientManager.id,
        type: EntryViewType.WordEditor,
    });
});

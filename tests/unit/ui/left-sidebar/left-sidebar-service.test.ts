import { waitFor } from "@testing-library/svelte";
import { describe, expect, vi } from "vitest";

import { EntryType, EntryViewType, SidebarSectionType } from "@/constants";

import { test } from "./fixtures";

describe("left sidebar section lifecycle", () => {
    test("reuses the spotlight section and releases it only for the owning section", async ({
        standaloneLeftSidebar,
    }) => {
        const first = standaloneLeftSidebar.addSpotlight("owner-1");
        const second = standaloneLeftSidebar.addSpotlight("owner-2");

        expect(second).toBe(first);
        expect([...standaloneLeftSidebar.iterateSections()]).toHaveLength(1);

        const wrongOwnerRelease = standaloneLeftSidebar.releaseSection({
            ownerId: "owner-2",
            type: SidebarSectionType.EntrySpotlight,
        });
        expect(wrongOwnerRelease).toBe(false);

        const ownerRelease = standaloneLeftSidebar.releaseSection({
            ownerId: "owner-1",
            type: SidebarSectionType.EntrySpotlight,
        });
        expect(ownerRelease).toBe(true);
        expect(
            standaloneLeftSidebar.getSectionByType(
                SidebarSectionType.EntrySpotlight,
            ),
        ).toBeNull();
    });

    test("reloads navigator state without creating a second section", async ({
        standaloneLeftSidebar,
    }) => {
        const onSelect = vi.fn();
        standaloneLeftSidebar.onSelectEntryEditorNavItem.subscribe(onSelect);

        const first = standaloneLeftSidebar.addEntryEditorNavigator({
            ownerId: "panel-1",
            entry: { id: 1, type: EntryType.Person, title: "first-title" },
            activeView: EntryViewType.ArticleEditor,
        });

        const second = standaloneLeftSidebar.addEntryEditorNavigator({
            ownerId: "panel-2",
            entry: { id: 2, type: EntryType.Language, title: "second-title" },
            activeView: EntryViewType.PropertyEditor,
        });

        expect(second).toBe(first);
        expect(first.entryId).toBe(2);
        expect(first.entryType).toBe(EntryType.Language);
        expect(first.title).toBe("second-title");
        expect(first.activeView).toBe(EntryViewType.PropertyEditor);
        expect([...standaloneLeftSidebar.iterateSections()]).toHaveLength(1);

        first.selectView(EntryViewType.WordEditor);

        expect(onSelect).toHaveBeenCalledWith({
            panelId: "panel-2",
            type: EntryViewType.WordEditor,
        });
    });
});

describe("left sidebar spotlight wiring", () => {
    test("updates spotlight and active navigator title for the displayed entry", async ({
        standaloneLeftSidebar,
        entryId,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const navigator = standaloneLeftSidebar.addEntryEditorNavigator({
            ownerId: "panel-1",
            entry: {
                id: entryId,
                type: EntryType.Person,
                title: "before-rename",
            },
            activeView: EntryViewType.ArticleEditor,
        });

        await waitFor(() => {
            expect(
                spotlight.fileTree.getNode(spotlight.toEntryNodeId(entryId)),
            ).toBeTruthy();
        });

        standaloneLeftSidebar.updateDisplayedEntryTitle(entryId, "renamed");

        const node = spotlight.fileTree.getNode(
            spotlight.toEntryNodeId(entryId),
        );
        expect(node?.text).toBe("renamed");
        expect(navigator.title).toBe("renamed");
    });
});

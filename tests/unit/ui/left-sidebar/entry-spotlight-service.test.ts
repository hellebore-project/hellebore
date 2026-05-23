import { waitFor } from "@testing-library/svelte";
import { describe, expect, vi } from "vitest";

import { SyncType } from "@/constants";

import { test } from "./fixtures";

describe("entry spotlight interactions", () => {
    test.scoped({
        otherFolders: async ({}, use) => {
            use([
                {
                    id: 2,
                    parentId: -1,
                    name: "other-folder",
                },
            ]);
        },
    });

    test("selecting a leaf node focuses spotlight and emits open-entry", async ({
        standaloneLeftSidebar,
        entryId,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onOpenEntry = vi.fn();
        spotlight.onOpenEntry.subscribe(onOpenEntry);

        await waitFor(() => {
            expect(
                spotlight.fileTree.getNode(spotlight.toEntryNodeId(entryId)),
            ).toBeTruthy();
        });

        const node = spotlight.fileTree.getNode(
            spotlight.toEntryNodeId(entryId),
        );
        expect(node).toBeTruthy();

        spotlight.selectEntry(node!);

        expect(spotlight.focused).toBe(true);
        expect(onOpenEntry).toHaveBeenCalledWith({ id: entryId });
    });

    test("tracks renamed entries for polling and clears synced changes", async ({
        standaloneLeftSidebar,
        entryId,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        standaloneLeftSidebar.onDataChange.subscribe(() => undefined);

        await waitFor(() => {
            expect(
                spotlight.fileTree.getNode(spotlight.toEntryNodeId(entryId)),
            ).toBeTruthy();
        });

        const node = spotlight.fileTree.getNode(
            spotlight.toEntryNodeId(entryId),
        );
        expect(node).toBeTruthy();

        node!.text = "renamed title";
        await spotlight.updateName(node!);

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual([
            { id: entryId, title: "renamed title" },
        ]);
        expect(
            spotlight.fetchChanges({
                type: SyncType.PARTIAL,
                entries: [{ id: entryId, syncTitle: true }],
            }),
        ).toStrictEqual([{ id: entryId, title: "renamed title" }]);

        spotlight.handleSynchronization([
            {
                request: {
                    id: entryId,
                    title: "renamed title",
                    words: null,
                },
                response: {
                    entry: {
                        id: entryId,
                        folderId: { updated: false },
                        title: { updated: true, isUnique: true },
                        properties: { updated: false },
                        text: { updated: false },
                        words: [],
                    },
                },
            },
        ]);

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual(
            [],
        );
    });

    test("moving an entry emits deferred folder sync changes", async ({
        standaloneLeftSidebar,
        entryId,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onDataChange = vi.fn();
        standaloneLeftSidebar.onDataChange.subscribe(onDataChange);

        await waitFor(() => {
            expect(
                spotlight.fileTree.getNode(spotlight.toEntryNodeId(entryId)),
            ).toBeTruthy();
        });

        const node = spotlight.fileTree.getNode(
            spotlight.toEntryNodeId(entryId),
        );
        expect(node).toBeTruthy();

        await spotlight.fileTree.moveNode(
            node!.id,
            spotlight.toFolderNodeId(2),
        );

        expect(onDataChange).toHaveBeenCalledWith({
            entries: [
                {
                    id: entryId,
                    folderIdChanged: true,
                    syncImmediately: false,
                },
            ],
        });
        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual([
            { id: entryId, folderId: 2 },
        ]);

        spotlight.handleSynchronization([
            {
                request: {
                    id: entryId,
                    folderId: 2,
                    words: null,
                },
                response: {
                    entry: {
                        id: entryId,
                        folderId: { updated: true },
                        title: { updated: false, isUnique: true },
                        properties: { updated: false },
                        text: { updated: false },
                        words: [],
                    },
                },
            },
        ]);

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual(
            [],
        );
    });
});

import { waitFor } from "@testing-library/svelte";
import { describe, expect, vi } from "vitest";
import { NIL as NIL_UUID } from "uuid";

import { SyncType } from "@/constants";

import { test } from "./fixtures";

describe("entry spotlight interactions", () => {
    test.override({
        otherFolders: async ({}, use) => {
            use([
                {
                    id: "folder2",
                    parentId: NIL_UUID,
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
                spotlight.tree.getNode(spotlight.generateEntryNodeId(entryId)),
            ).toBeTruthy();
        });

        const node = spotlight.tree.getNode(
            spotlight.generateEntryNodeId(entryId),
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
                spotlight.tree.getNode(spotlight.generateEntryNodeId(entryId)),
            ).toBeTruthy();
        });

        const node = spotlight.tree.getNode(
            spotlight.generateEntryNodeId(entryId),
        );
        expect(node).toBeTruthy();

        node!.text = "renamed title";
        await spotlight.updateName(node!);

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [{ id: entryId, title: "renamed title" }],
            folders: [],
        });
        expect(
            spotlight.fetchChanges({
                type: SyncType.PARTIAL,
                entries: [{ id: entryId, syncTitle: true }],
            }),
        ).toStrictEqual({
            entries: [{ id: entryId, title: "renamed title" }],
            folders: [],
        });

        spotlight.handleSynchronization({
            entries: [
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
            ],
        });

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [],
        });
    });

    test("moving an entry emits deferred folder sync changes", async ({
        standaloneLeftSidebar,
        entryId,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onDataChange = vi.fn();
        standaloneLeftSidebar.onDataChange.subscribe(onDataChange);

        const node = await waitFor(() => {
            const node = spotlight.tree.getNode(
                spotlight.generateEntryNodeId(entryId),
            );
            expect(node).toBeTruthy();
            return node;
        });

        await spotlight.tree.moveNode(
            node!.id,
            spotlight.generateFolderNodeId("folder2"),
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
        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [{ id: entryId, folderId: "folder2" }],
            folders: [],
        });

        spotlight.handleSynchronization({
            entries: [
                {
                    request: {
                        id: entryId,
                        folderId: "folder",
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
            ],
        });

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [],
        });
    });

    test("awaits folder creation and sets node id from response", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onCreateFolder = vi.fn().mockResolvedValue({
            id: "folder99",
            parentId: NIL_UUID,
            name: "new folder",
        });
        standaloneLeftSidebar.onCreateFolder.subscribe(onCreateFolder);

        const placeholderFolder = spotlight.tree.addBranchNode({
            id: "new-folder",
            parentId: spotlight.tree.rootNodeId,
            text: "new folder",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });

        await spotlight.updateName(placeholderFolder);

        expect(onCreateFolder).toHaveBeenCalledWith({
            name: "new folder",
            parentFolderId: NIL_UUID,
        });
        expect(spotlight.tree.getNode("new-folder")?.data.id).toBe("folder99");
        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [],
        });
    });

    test("tracks renamed folders for deferred sync and clears them after sync", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onDataChange = vi.fn();
        standaloneLeftSidebar.onDataChange.subscribe(onDataChange);

        const folderNode = spotlight.tree.addBranchNode({
            id: spotlight.generateFolderNodeId("folder7"),
            parentId: spotlight.tree.rootNodeId,
            text: "old folder",
            data: {
                id: "folder7",
                titleChanged: false,
                folderIdChanged: false,
            },
        });

        folderNode.text = "renamed folder";
        await spotlight.updateName(folderNode);

        expect(onDataChange).toHaveBeenCalledWith({
            folders: [
                {
                    id: "folder7",
                    titleChanged: true,
                    syncImmediately: false,
                },
            ],
        });
        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [
                {
                    id: "folder7",
                    parentId: NIL_UUID,
                    name: "renamed folder",
                },
            ],
        });

        spotlight.handleSynchronization({
            folders: [
                {
                    request: {
                        id: "folder7",
                        parentId: NIL_UUID,
                        name: "renamed folder",
                    },
                    response: {
                        folder: {
                            id: "folder7",
                            parentId: NIL_UUID,
                            name: "renamed folder",
                            nameChanged: true,
                            parentChanged: false,
                        },
                    },
                },
            ],
        });

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [],
        });
    });

    test("rejects folder validation when parent is a placeholder node", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");

        const placeholderParent = spotlight.tree.addBranchNode({
            id: "new-parent",
            parentId: spotlight.tree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childFolder = spotlight.tree.addBranchNode({
            id: "folder-child",
            parentId: placeholderParent.id,
            text: "child",
            data: {
                id: "folder99",
                titleChanged: false,
                folderIdChanged: false,
            },
        });

        const result = await spotlight.validateName(childFolder, "renamed");

        expect(result).toStrictEqual({
            success: false,
            message: "Parent folder is not available yet.",
        });
    });

    test("does not emit folder creation when parent is a placeholder node", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onCreateFolder = vi.fn();
        standaloneLeftSidebar.onCreateFolder.subscribe(onCreateFolder);

        const placeholderParent = spotlight.tree.addBranchNode({
            id: "new-parent",
            parentId: spotlight.tree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childPlaceholder = spotlight.tree.addBranchNode({
            id: "new-child",
            parentId: placeholderParent.id,
            text: "child",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });

        const result = await spotlight.updateName(childPlaceholder);

        expect(result.success).toBe(false);
        expect(onCreateFolder).not.toHaveBeenCalled();
    });

    test("does not emit folder move when source parent is a placeholder node", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onMoveFolder = vi.fn(async () => ({
            moved: true,
            cancelled: false,
            update: null,
            deletion: null,
        }));
        spotlight.onMoveFolder.subscribe(onMoveFolder);

        const placeholderParent = spotlight.tree.addBranchNode({
            id: "new-parent",
            parentId: spotlight.tree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childFolder = spotlight.tree.addBranchNode({
            id: "folder-child",
            parentId: placeholderParent.id,
            text: "child",
            data: {
                id: "folder99",
                titleChanged: false,
                folderIdChanged: false,
            },
        });
        const destinationFolder = spotlight.tree.addBranchNode({
            id: spotlight.generateFolderNodeId("folder2"),
            parentId: spotlight.tree.rootNodeId,
            text: "destination",
            data: {
                id: "folder2",
                titleChanged: false,
                folderIdChanged: false,
            },
        });

        const moved = await spotlight.finalizeMove(
            childFolder,
            destinationFolder.id,
        );

        expect(moved).toBe(false);
        expect(onMoveFolder).not.toHaveBeenCalled();
    });
});

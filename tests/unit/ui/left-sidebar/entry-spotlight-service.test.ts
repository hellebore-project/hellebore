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
                spotlight.fileTree.getNode(
                    spotlight.generateEntryNodeId(entryId),
                ),
            ).toBeTruthy();
        });

        const node = spotlight.fileTree.getNode(
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
                spotlight.fileTree.getNode(
                    spotlight.generateEntryNodeId(entryId),
                ),
            ).toBeTruthy();
        });

        const node = spotlight.fileTree.getNode(
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

        await waitFor(() => {
            expect(
                spotlight.fileTree.getNode(
                    spotlight.generateEntryNodeId(entryId),
                ),
            ).toBeTruthy();
        });

        const node = spotlight.fileTree.getNode(
            spotlight.generateEntryNodeId(entryId),
        );
        expect(node).toBeTruthy();

        await spotlight.fileTree.moveNode(
            node!.id,
            spotlight.generateFolderNodeId(2),
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
            entries: [{ id: entryId, folderId: 2 }],
            folders: [],
        });

        spotlight.handleSynchronization({
            entries: [
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
            ],
        });

        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [],
        });
    });

    test("tracks new folders for immediate sync and clears them after sync", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const onDataChange = vi.fn();
        standaloneLeftSidebar.onDataChange.subscribe(onDataChange);

        const placeholderFolder = spotlight.fileTree.addFolderNode({
            id: "new-folder",
            parentId: spotlight.fileTree.rootNodeId,
            text: "new folder",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });

        await spotlight.updateName(placeholderFolder);

        expect(onDataChange).toHaveBeenCalledWith({
            folders: [
                {
                    id: null,
                    titleChanged: true,
                    syncImmediately: true,
                },
            ],
        });
        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [
                {
                    id: null,
                    parentId: -1,
                    name: "new folder",
                },
            ],
        });

        spotlight.handleSynchronization({
            folders: [
                {
                    request: {
                        id: null,
                        parentId: -1,
                        name: "new folder",
                    },
                    response: {
                        folder: {
                            id: 99,
                            parentId: -1,
                            name: "new folder",
                            parentChanged: true,
                            nameChanged: true,
                        },
                    },
                },
            ],
        });

        expect(spotlight.fileTree.getNode("new-folder")?.data.id).toBe(99);
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

        const folderNode = spotlight.fileTree.addFolderNode({
            id: spotlight.generateFolderNodeId(7),
            parentId: spotlight.fileTree.rootNodeId,
            text: "old folder",
            data: { id: 7, titleChanged: false, folderIdChanged: false },
        });

        folderNode.text = "renamed folder";
        await spotlight.updateName(folderNode);

        expect(onDataChange).toHaveBeenCalledWith({
            folders: [
                {
                    id: 7,
                    titleChanged: true,
                    syncImmediately: false,
                },
            ],
        });
        expect(spotlight.fetchChanges({ type: SyncType.FULL })).toStrictEqual({
            entries: [],
            folders: [
                {
                    id: 7,
                    parentId: -1,
                    name: "renamed folder",
                },
            ],
        });

        spotlight.handleSynchronization({
            folders: [
                {
                    request: {
                        id: 7,
                        parentId: -1,
                        name: "renamed folder",
                    },
                    response: {
                        folder: {
                            id: 7,
                            parentId: -1,
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

        const placeholderParent = spotlight.fileTree.addFolderNode({
            id: "new-parent",
            parentId: spotlight.fileTree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childFolder = spotlight.fileTree.addFolderNode({
            id: "folder-child",
            parentId: placeholderParent.id,
            text: "child",
            data: { id: 99, titleChanged: false, folderIdChanged: false },
        });

        const result = await spotlight.validateName(childFolder, "renamed");

        expect(result).toStrictEqual({
            valid: false,
            error: "Parent folder is not available yet.",
        });
    });

    test("does not create folder when parent is a placeholder node", async ({
        standaloneLeftSidebar,
    }) => {
        const spotlight = standaloneLeftSidebar.addSpotlight("owner");
        const createFolderSpy = vi.spyOn(
            (spotlight as any)._domain.folders,
            "create",
        );

        const placeholderParent = spotlight.fileTree.addFolderNode({
            id: "new-parent",
            parentId: spotlight.fileTree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childPlaceholder = spotlight.fileTree.addFolderNode({
            id: "new-child",
            parentId: placeholderParent.id,
            text: "child",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });

        const textEdit = await spotlight.updateName(childPlaceholder);

        expect(textEdit).toBeNull();
        expect(createFolderSpy).not.toHaveBeenCalled();
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

        const placeholderParent = spotlight.fileTree.addFolderNode({
            id: "new-parent",
            parentId: spotlight.fileTree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childFolder = spotlight.fileTree.addFolderNode({
            id: "folder-child",
            parentId: placeholderParent.id,
            text: "child",
            data: { id: 99, titleChanged: false, folderIdChanged: false },
        });
        const destinationFolder = spotlight.fileTree.addFolderNode({
            id: spotlight.generateFolderNodeId(2),
            parentId: spotlight.fileTree.rootNodeId,
            text: "destination",
            data: { id: 2, titleChanged: false, folderIdChanged: false },
        });

        const moved = await spotlight.finalizeMove(
            childFolder,
            destinationFolder.id,
        );

        expect(moved).toBe(false);
        expect(onMoveFolder).not.toHaveBeenCalled();
    });
});

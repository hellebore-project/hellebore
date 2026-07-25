import { screen, waitFor } from "@testing-library/svelte";
import { NIL as NIL_UUID } from "uuid";
import { describe, expect, vi } from "vitest";

import { SidebarSectionType, SyncType } from "@/constants";
import { EntrySpotlight, LeftSidebar } from "@/ui/left-sidebar";
import { render } from "@tests/utils";

import { test } from "./fixtures";
import { mockCreateFolder } from "@tests/utils/mocks";

test("is a singleton", async ({ leftSidebarService }) => {
    leftSidebarService.removeAllSections();

    render(LeftSidebar, { props: { service: leftSidebarService } });

    const sectionService1 = leftSidebarService.addSpotlight("owner-1");
    const sectionService2 = leftSidebarService.addSpotlight("owner-2");
    expect(sectionService1).toBe(sectionService2);
});

test("can only be removed by the original owner", async ({
    leftSidebarService,
}) => {
    leftSidebarService.removeAllSections();

    render(LeftSidebar, { props: { service: leftSidebarService } });

    leftSidebarService.addSpotlight("owner-1");

    const spotlight = await screen.findByText("SPOTLIGHT");
    expect(spotlight).toBeTruthy();

    let released = leftSidebarService.releaseSection({
        ownerId: "owner-2",
        type: SidebarSectionType.EntrySpotlight,
    });
    expect(released).toBe(false);

    released = leftSidebarService.releaseSection({
        ownerId: "owner-1",
        type: SidebarSectionType.EntrySpotlight,
    });
    expect(released).toBe(true);

    expect(
        leftSidebarService.getSectionByType(SidebarSectionType.EntrySpotlight),
    ).toBeNull();
    waitFor(() => expect(screen.queryByText("SPOTLIGHT")).toBeNull());
});

test("selecting a leaf node focuses spotlight and emits open-entry", async ({
    user,
    entrySpotlightService,
    entryId,
    entryTitle,
}) => {
    const onOpenEntry = vi.fn();
    entrySpotlightService.onOpenEntry.subscribe(onOpenEntry);

    render(EntrySpotlight, { props: { service: entrySpotlightService } });

    const node = screen.getByText(entryTitle);
    await user.click(node);

    expect(entrySpotlightService.focused).toBe(true);
    expect(onOpenEntry).toHaveBeenCalledWith({ id: entryId });
});

test("tracks renamed entries for polling and clears synced changes", async ({
    leftSidebarService,
    entrySpotlightService,
    entryId,
}) => {
    leftSidebarService.onDataChange.subscribe(() => undefined);

    const nodeId = entrySpotlightService.generateEntryNodeId(entryId);
    const node = await waitFor(() => {
        const node = entrySpotlightService.tree.getNode(nodeId);
        expect(node).toBeTruthy();
        return node;
    });

    node!.text = "renamed title";
    await entrySpotlightService.updateName(node!);

    expect(
        entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
    ).toStrictEqual({
        entries: [{ id: entryId, title: "renamed title" }],
        folders: [],
    });
    expect(
        entrySpotlightService.fetchChanges({
            type: SyncType.PARTIAL,
            entries: [{ id: entryId, syncTitle: true }],
        }),
    ).toStrictEqual({
        entries: [{ id: entryId, title: "renamed title" }],
        folders: [],
    });

    entrySpotlightService.handleSynchronization({
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

    expect(
        entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
    ).toStrictEqual({
        entries: [],
        folders: [],
    });
});

test("tracks renamed folders for deferred sync and clears them after sync", async ({
    leftSidebarService,
    entrySpotlightService,
}) => {
    const onDataChange = vi.fn();
    leftSidebarService.onDataChange.subscribe(onDataChange);

    const folderNode = entrySpotlightService.tree.addBranchNode({
        id: entrySpotlightService.generateFolderNodeId("folder7"),
        parentId: entrySpotlightService.tree.rootNodeId,
        text: "old folder",
        data: {
            id: "folder7",
            titleChanged: false,
            folderIdChanged: false,
        },
    });

    folderNode.text = "renamed folder";
    await entrySpotlightService.updateName(folderNode);

    expect(onDataChange).toHaveBeenCalledWith({
        folders: [
            {
                id: "folder7",
                titleChanged: true,
                syncImmediately: false,
            },
        ],
    });
    expect(
        entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
    ).toStrictEqual({
        entries: [],
        folders: [
            {
                id: "folder7",
                parentId: NIL_UUID,
                name: "renamed folder",
            },
        ],
    });

    entrySpotlightService.handleSynchronization({
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

    expect(
        entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
    ).toStrictEqual({
        entries: [],
        folders: [],
    });
});

test("awaits folder creation and sets node id from response", async ({
    mockedInvoker,
    entrySpotlightService,
}) => {
    mockCreateFolder(mockedInvoker, "folder99", {
        parentId: NIL_UUID,
        name: "new folder",
    });

    const placeholderFolder = entrySpotlightService.tree.addBranchNode({
        id: "new-folder",
        parentId: entrySpotlightService.tree.rootNodeId,
        text: "new folder",
        data: { id: null, titleChanged: false, folderIdChanged: false },
    });

    await entrySpotlightService.updateName(placeholderFolder);

    expect(entrySpotlightService.tree.getNode("new-folder")?.data.id).toBe(
        "folder99",
    );
    expect(
        entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
    ).toStrictEqual({
        entries: [],
        folders: [],
    });
});

test("does not emit folder creation when parent is a placeholder node", async ({
    leftSidebarService,
    entrySpotlightService,
}) => {
    const onCreateFolder = vi.fn();
    leftSidebarService.onCreateFolder.subscribe(onCreateFolder);

    const placeholderParent = entrySpotlightService.tree.addBranchNode({
        id: "new-parent",
        parentId: entrySpotlightService.tree.rootNodeId,
        text: "",
        data: { id: null, titleChanged: false, folderIdChanged: false },
    });
    const childPlaceholder = entrySpotlightService.tree.addBranchNode({
        id: "new-child",
        parentId: placeholderParent.id,
        text: "child",
        data: { id: null, titleChanged: false, folderIdChanged: false },
    });

    const result = await entrySpotlightService.updateName(childPlaceholder);

    expect(result.success).toBe(false);
    expect(onCreateFolder).not.toHaveBeenCalled();
});

test("rejects folder validation when parent is a placeholder node", async ({
    entrySpotlightService,
}) => {
    const placeholderParent = entrySpotlightService.tree.addBranchNode({
        id: "new-parent",
        parentId: entrySpotlightService.tree.rootNodeId,
        text: "",
        data: { id: null, titleChanged: false, folderIdChanged: false },
    });
    const childFolder = entrySpotlightService.tree.addBranchNode({
        id: "folder-child",
        parentId: placeholderParent.id,
        text: "child",
        data: {
            id: "folder99",
            titleChanged: false,
            folderIdChanged: false,
        },
    });

    const result = await entrySpotlightService.validateName(
        childFolder,
        "renamed",
    );

    expect(result).toStrictEqual({
        success: false,
        message: "Parent folder is not available yet.",
    });
});

describe("moving a node", () => {
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

    test("moving an entry emits deferred folder sync changes", async ({
        leftSidebarService,
        entrySpotlightService,
        entryId,
    }) => {
        const onDataChange = vi.fn();
        leftSidebarService.onDataChange.subscribe(onDataChange);

        const node = await waitFor(() => {
            const node = entrySpotlightService.tree.getNode(
                entrySpotlightService.generateEntryNodeId(entryId),
            );
            expect(node).toBeTruthy();
            return node;
        });

        await entrySpotlightService.tree.moveNode(
            node!.id,
            entrySpotlightService.generateFolderNodeId("folder2"),
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
        expect(
            entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
        ).toStrictEqual({
            entries: [{ id: entryId, folderId: "folder2" }],
            folders: [],
        });

        entrySpotlightService.handleSynchronization({
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

        expect(
            entrySpotlightService.fetchChanges({ type: SyncType.FULL }),
        ).toStrictEqual({
            entries: [],
            folders: [],
        });
    });

    test("does not emit folder move when source parent is a placeholder node", async ({
        entrySpotlightService,
    }) => {
        const onMoveFolder = vi.fn(async () => ({
            moved: true,
            cancelled: false,
            update: null,
            deletion: null,
        }));
        entrySpotlightService.onMoveFolder.subscribe(onMoveFolder);

        const placeholderParent = entrySpotlightService.tree.addBranchNode({
            id: "new-parent",
            parentId: entrySpotlightService.tree.rootNodeId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        const childFolder = entrySpotlightService.tree.addBranchNode({
            id: "folder-child",
            parentId: placeholderParent.id,
            text: "child",
            data: {
                id: "folder99",
                titleChanged: false,
                folderIdChanged: false,
            },
        });
        const destinationFolder = entrySpotlightService.tree.addBranchNode({
            id: entrySpotlightService.generateFolderNodeId("folder2"),
            parentId: entrySpotlightService.tree.rootNodeId,
            text: "destination",
            data: {
                id: "folder2",
                titleChanged: false,
                folderIdChanged: false,
            },
        });

        const moved = await entrySpotlightService.finalizeMove(
            childFolder,
            destinationFolder.id,
        );

        expect(moved).toBe(false);
        expect(onMoveFolder).not.toHaveBeenCalled();
    });
});

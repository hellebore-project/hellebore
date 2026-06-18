import { ask } from "@tauri-apps/plugin-dialog";
import { NIL as NIL_UUID } from "uuid";
import { describe, expect, vi } from "vitest";

import { FolderResponse } from "@/api/interface/folder";
import { mockUpdateFolder } from "@tests/utils/mocks";

import { test } from "./fixtures";

vi.mock("@tauri-apps/plugin-dialog", () => ({
    ask: vi.fn(),
    open: vi.fn(),
}));

describe("moving folders", () => {
    test.override({
        parentFolder: async ({}, use) => {
            use({
                id: "folder2",
                parentId: NIL_UUID,
                name: "mocked-folder-2",
            });
        },
        otherFolders: async ({ parentFolder }, use) => {
            use([parentFolder as FolderResponse]);
        },
    });

    test("can move folder to another location", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        mockUpdateFolder(mockedInvoker, {
            id: folder.id,
            parentChanged: true,
            nameChanged: false,
        });

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: "folder2",
                confirm: false,
            });

        expect(moved).toBe(true);
        expect(cancelled).toBe(false);
        expect(update).toStrictEqual({
            id: folder.id,
            parentId: "folder2",
            name: null,
            nameChanged: false,
            parentChanged: true,
        });
        expect(deletion).toBe(null);
    });
});

describe("folder name collision", () => {
    test.override({
        isUnique: false,
        parentFolder: async ({}, use) => {
            use({
                id: "folder2",
                parentId: NIL_UUID,
                name: "mocked-folder-2",
            });
        },
        collidingFolder: async ({}, use) => {
            use({
                id: "folder3",
                parentId: "folder2",
                name: "mocked-folder",
            });
        },
        otherFolders: async ({ parentFolder, collidingFolder }, use) => {
            use([
                parentFolder as FolderResponse,
                collidingFolder as FolderResponse,
            ]);
        },
        deletedFolderIds: async ({}, use) => use(["folder3"]),
    });

    test("can delete folder on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        mockUpdateFolder(mockedInvoker, {
            id: folder.id,
            parentChanged: true,
            nameChanged: false,
        });

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: "folder2",
                confirm: false,
            });

        expect(moved).toBe(true);
        expect(cancelled).toBe(false);
        expect(update).toStrictEqual({
            id: folder.id,
            parentId: "folder2",
            name: null,
            nameChanged: false,
            parentChanged: true,
        });
        expect(deletion).toStrictEqual({ entries: [], folders: ["folder3"] });
    });

    test("user confirms move on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        vi.mocked(ask).mockResolvedValue(true);

        mockUpdateFolder(mockedInvoker, {
            id: folder.id,
            parentChanged: true,
            nameChanged: false,
        });

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: "folder2",
                confirm: true,
            });

        expect(moved).toBe(true);
        expect(cancelled).toBe(false);
        expect(update).toStrictEqual({
            id: folder.id,
            parentId: "folder2",
            name: null,
            nameChanged: false,
            parentChanged: true,
        });
        expect(deletion).toStrictEqual({ entries: [], folders: ["folder3"] });
    });

    test("user cancels move on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        vi.mocked(ask).mockResolvedValue(false);

        const updatedFolder = {
            ...folder,
            parentId: "folder2",
            parentChanged: false,
            nameChanged: false,
        };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: "folder2",
                confirm: true,
            });

        expect(moved).toBe(false);
        expect(cancelled).toBe(true);
        expect(update).toBe(null);
        expect(deletion).toBe(null);
    });
});

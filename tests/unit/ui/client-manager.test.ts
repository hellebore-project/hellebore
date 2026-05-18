import { ask } from "@tauri-apps/plugin-dialog";
import { describe, expect, vi } from "vitest";

import type { FolderResponse, FolderValidateResponse, Id } from "@/interface";
import { test as baseTest } from "@tests/unit/ui/fixtures";
import {
    mockGetFolder,
    mockDeleteFolder,
    mockUpdateFolder,
    mockValidateFolder,
} from "@tests/utils/mocks";

vi.mock("@tauri-apps/plugin-dialog", () => ({
    ask: vi.fn(),
    open: vi.fn(),
}));

describe("moving folders", () => {
    interface MoveFolderFixtures {
        isUnique: boolean;
        parentFolder: FolderResponse;
        collidingFolder: FolderResponse;
        deletedFolderIds: Id[];
        mockFolderValidation: FolderValidateResponse;
        mockFolderDeletion: null;
    }

    const test = baseTest.extend<MoveFolderFixtures>({
        isUnique: true,
        parentFolder: null,
        collidingFolder: null,
        deletedFolderIds: async ({}, use) => use([]),

        mockFolderValidation: [
            async (
                { mockedInvoker, folder, collidingFolder, isUnique },
                use,
            ) => {
                const response: FolderValidateResponse = {
                    ...folder,
                    id: folder.id,
                    nameCollision: null,
                };

                if (!isUnique) {
                    response.nameCollision = {
                        isUnique: false,
                        collidingFolder,
                    };

                    mockGetFolder(mockedInvoker, collidingFolder);
                }

                mockValidateFolder(mockedInvoker, response);
                use(response);
            },
            { auto: true },
        ],
        mockFolderDeletion: [
            async ({ mockedInvoker, deletedFolderIds }, use) => {
                mockDeleteFolder(mockedInvoker, deletedFolderIds, []);
                use(null);
            },
            { auto: true },
        ],
    });

    test.scoped({
        parentFolder: async ({}, use) => {
            use({
                id: 2,
                parentId: -1,
                name: "mocked-folder-2",
            });
        },
        otherFolders: async ({ parentFolder }, use) => {
            use([parentFolder]);
        },
    });

    test("can move folder to another location", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        const updatedFolder = { ...folder, parentId: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: 2,
                confirm: false,
            });

        expect(moved).toBe(true);
        expect(cancelled).toBe(false);
        expect(update).toStrictEqual({
            ...updatedFolder,
            nameChanged: false,
            parentChanged: true,
        });
        expect(deletion).toBe(null);
    });

    test.scoped({
        isUnique: false,
        parentFolder: async ({}, use) => {
            use({
                id: 2,
                parentId: -1,
                name: "mocked-folder-2",
            });
        },
        collidingFolder: async ({}, use) => {
            use({
                id: 3,
                parentId: 2,
                name: "mocked-folder",
            });
        },
        otherFolders: async ({ parentFolder, collidingFolder }, use) => {
            use([parentFolder, collidingFolder]);
        },
        deletedFolderIds: async ({}, use) => use([3]),
    });

    test("can delete folder on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        const updatedFolder = { ...folder, parentId: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: 2,
                confirm: false,
            });

        expect(moved).toBe(true);
        expect(cancelled).toBe(false);
        expect(update).toStrictEqual({
            ...updatedFolder,
            nameChanged: false,
            parentChanged: true,
        });
        expect(deletion).toStrictEqual({ entries: [], folders: [3] });
    });

    test("user confirms move on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        vi.mocked(ask).mockResolvedValue(true);

        const updatedFolder = { ...folder, parentId: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: 2,
                confirm: true,
            });

        expect(moved).toBe(true);
        expect(cancelled).toBe(false);
        expect(update).toStrictEqual({
            ...updatedFolder,
            nameChanged: false,
            parentChanged: true,
        });
        expect(deletion).toStrictEqual({ entries: [], folders: [3] });
    });

    test("user cancels move on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        vi.mocked(ask).mockResolvedValue(false);

        const updatedFolder = { ...folder, parentId: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parentId,
                destParentId: 2,
                confirm: true,
            });

        expect(moved).toBe(false);
        expect(cancelled).toBe(true);
        expect(update).toBe(null);
        expect(deletion).toBe(null);
    });
});

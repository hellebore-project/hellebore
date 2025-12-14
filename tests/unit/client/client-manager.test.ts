import { describe, expect, vi } from "vitest";

import { FolderResponse, FolderValidateResponse } from "@/domain";
import { test as baseTest } from "@tests/unit/client/fixtures";
import {
    mockDeleteFolder,
    mockUpdateFolder,
    mockValidateFolder,
} from "@tests/utils/mocks";

vi.mock("@tauri-apps/plugin-dialog");

describe("moving folders", () => {
    interface MoveFolderFixtures {
        isUnique: boolean;
        parentFolder: FolderResponse;
        collidingFolder: FolderResponse | null;
        mockFolderValidation: FolderValidateResponse;
        mockFolderDeletion: null;
    }

    const test = baseTest.extend<MoveFolderFixtures>({
        // data
        isUnique: true,
        parentFolder: async ({}, use) => {
            use({
                id: 2,
                parentId: -1,
                name: "mocked-folder-2",
            });
        },
        collidingFolder: async ({}, use) => {
            use(null);
        },

        // mocking
        mockFolderValidation: [
            async (
                { mockedInvoker, folder, collidingFolder, isUnique },
                use,
            ) => {
                const response: FolderValidateResponse = {
                    ...folder,
                    nameCollision: null,
                };

                if (!isUnique)
                    response.nameCollision = {
                        isUnique: false,
                        collidingFolder,
                    };

                mockValidateFolder(mockedInvoker, response);
                use(response);
            },
            { auto: true },
        ],
        mockFolderDeletion: [
            async ({ mockedInvoker }, use) => {
                mockDeleteFolder(mockedInvoker);
                use(null);
            },
            { auto: true },
        ],
    });

    test.scoped({
        folders: async ({ folder, parentFolder }, use) => {
            use([folder, parentFolder]);
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
        collidingFolder: async ({}, use) => {
            use({
                id: 3,
                parentId: 2,
                name: "mocked-folder",
            });
        },
        folders: async ({ folder, parentFolder, collidingFolder }, use) => {
            use([folder, parentFolder, collidingFolder]);
        },
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
        mockedFolder,
    }) => {
        const plugin = await import("@tauri-apps/plugin-dialog");
        plugin.ask = vi.fn().mockResolvedValue(true);

        const updatedFolder = { ...mockedFolder, parentId: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: mockedFolder.id,
                title: mockedFolder.name,
                sourceParentId: mockedFolder.parentId,
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
        mockedFolder,
    }) => {
        const plugin = await import("@tauri-apps/plugin-dialog");
        plugin.ask = vi.fn().mockResolvedValue(false);

        const updatedFolder = { ...mockedFolder, parentId: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: mockedFolder.id,
                title: mockedFolder.name,
                sourceParentId: mockedFolder.parentId,
                destParentId: 2,
                confirm: true,
            });

        expect(moved).toBe(false);
        expect(cancelled).toBe(true);
        expect(update).toBe(null);
        expect(deletion).toBe(null);
    });
});

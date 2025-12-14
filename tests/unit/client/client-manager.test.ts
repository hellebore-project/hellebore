import { describe, expect, vi } from "vitest";

import { test } from "@tests/unit/client/fixtures";
import { mockDeleteFolder, mockUpdateFolder } from "@tests/utils/mocks";

vi.mock("@tauri-apps/plugin-dialog");

describe("moving folders", () => {
    test.scoped({
        folders: async ({ folder }, use) => {
            use([
                folder,
                {
                    id: 2,
                    parent_id: -1,
                    name: "mocked-folder-2",
                },
            ]);
        },
    });

    test("can move folder to another location", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        const updatedFolder = { ...folder, parent_id: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parent_id,
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
        folders: async ({ folder }, use) => {
            use([
                folder,
                {
                    id: 2,
                    parent_id: -1,
                    name: "mocked-folder-2",
                },
                {
                    id: 3,
                    parent_id: 2,
                    name: "mocked-folder",
                },
            ]);
        },
    });

    test("can delete folder on name collision", async ({
        mockedInvoker,
        clientManager,
        folder,
    }) => {
        const updatedFolder = { ...folder, parent_id: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);
        mockDeleteFolder(mockedInvoker);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: folder.id,
                title: folder.name,
                sourceParentId: folder.parent_id,
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

        const updatedFolder = { ...mockedFolder, parent_id: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);
        mockDeleteFolder(mockedInvoker);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: mockedFolder.id,
                title: mockedFolder.name,
                sourceParentId: mockedFolder.parent_id,
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

        const updatedFolder = { ...mockedFolder, parent_id: 2 };
        mockUpdateFolder(mockedInvoker, updatedFolder);
        mockDeleteFolder(mockedInvoker);

        const { moved, cancelled, update, deletion } =
            await clientManager.moveFolder({
                id: mockedFolder.id,
                title: mockedFolder.name,
                sourceParentId: mockedFolder.parent_id,
                destParentId: 2,
                confirm: true,
            });

        expect(moved).toBe(false);
        expect(cancelled).toBe(true);
        expect(update).toBe(null);
        expect(deletion).toBe(null);
    });
});

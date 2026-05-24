import { describe, expect, vi } from "vitest";

import { CommandNames, ROOT_FOLDER_ID } from "@/constants";
import {
    mockBulkUpsertFolders,
    mockDeleteFolder,
    mockGetFolder,
    mockGetFolders,
    mockUpdateFolder,
    mockValidateFolder,
} from "@tests/utils/mocks";

import { test } from "./fixtures";

const expectInvokePayloadMatch = (
    calls: unknown[][],
    command: string,
    payload: unknown,
) => {
    expect(
        calls.some(
            ([name, args]) =>
                name === command &&
                JSON.stringify(args) === JSON.stringify(payload),
        ),
    ).toBe(true);
};

describe("folder manager contracts", () => {
    test("create uses root folder by default and emits create invoke", async ({
        mockedInvoker,
        folderManager,
        folder,
    }) => {
        mockedInvoker.mockCommand(
            CommandNames.Folder.Create,
            async () => folder,
        );

        const response = await folderManager.create(folder.name);

        expect(response).toStrictEqual(folder);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Folder.Create,
            {
                info: {
                    parentId: ROOT_FOLDER_ID,
                    name: folder.name,
                },
            },
        );
    });

    test("validate returns response data and null on backend failures", async ({
        mockedInvoker,
        folderManager,
    }) => {
        const validation = {
            id: 10,
            parentId: -1,
            name: "valid-name",
            nameCollision: null,
        };
        mockValidateFolder(mockedInvoker, validation);

        const success = await folderManager.validate(10, -1, "valid-name");
        expect(success).toStrictEqual(validation);

        mockedInvoker.mockCommand(CommandNames.Folder.Validate, async () => {
            throw new Error("validate failed");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const failure = await folderManager.validate(10, -1, "invalid");
        expect(failure).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
    });

    test("update returns change metadata and invokes folder update", async ({
        mockedInvoker,
        folderManager,
        folder,
    }) => {
        const updatedFolder = { ...folder, parentId: 25, name: "renamed" };
        mockUpdateFolder(mockedInvoker, updatedFolder);

        const response = await folderManager.update({
            id: folder.id,
            name: "renamed",
            parentId: 25,
            oldParentId: folder.parentId,
        });

        expect(response).toStrictEqual({
            ...updatedFolder,
            parentChanged: true,
            nameChanged: true,
        });
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Folder.Update,
            {
                folder: {
                    id: folder.id,
                    parentId: 25,
                    name: "renamed",
                },
            },
        );
    });

    test("get and getAll return backend payloads through mapped commands", async ({
        mockedInvoker,
        folderManager,
        folder,
    }) => {
        mockGetFolder(mockedInvoker, folder);
        mockGetFolders(mockedInvoker, [folder]);

        const fetched = await folderManager.get(folder.id);
        const fetchedAll = await folderManager.getAll();

        expect(fetched).toStrictEqual(folder);
        expect(fetchedAll).toStrictEqual([folder]);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Folder.Get,
            {
                id: folder.id,
            },
        );
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Folder.GetAll,
            {},
        );
    });

    test("delete returns backend response and null on backend failure", async ({
        mockedInvoker,
        folderManager,
        folder,
    }) => {
        mockDeleteFolder(mockedInvoker, [folder.id], [100]);

        const success = await folderManager.delete(folder.id);
        expect(success).toStrictEqual({ folders: [folder.id], entries: [100] });

        mockedInvoker.mockCommand(CommandNames.Folder.Delete, async () => {
            throw new Error("delete failed");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const failure = await folderManager.delete(folder.id);

        expect(failure).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
    });

    test("bulkUpsert returns mapped response data and null on backend failure", async ({
        mockedInvoker,
        folderManager,
        folder,
    }) => {
        const createResponse = {
            id: 42,
            status: { created: true, updated: false },
        };
        const updateResponse = {
            id: folder.id,
            status: { created: false, updated: true },
        };
        mockBulkUpsertFolders(mockedInvoker, [createResponse, updateResponse]);

        const payloads = [
            { id: null, parentId: ROOT_FOLDER_ID, name: "new folder" },
            { id: folder.id, parentId: folder.parentId, name: "renamed" },
        ];

        const result = await folderManager.bulkUpsert(payloads);

        expect(result).toStrictEqual([createResponse, updateResponse]);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Folder.BulkUpsert,
            { folders: payloads },
        );

        mockedInvoker.mockCommand(CommandNames.Folder.BulkUpsert, async () => {
            throw new Error("bulk upsert failed");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const failure = await folderManager.bulkUpsert(payloads);
        expect(failure).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
    });
});

import { expect, vi } from "vitest";

import type { FolderResponse, FolderValidateResponse, Id } from "@/interface";
import { test as baseTest } from "@tests/unit/ui/fixtures";
import {
    mockGetFolder,
    mockDeleteFolder,
    mockUpdateFolder,
    mockValidateFolder,
} from "@tests/utils/mocks";

export interface MoveFolderFixtures {
    isUnique: boolean;
    parentFolder: FolderResponse;
    collidingFolder: FolderResponse;
    deletedFolderIds: Id[];
    mockFolderValidation: FolderValidateResponse;
    mockFolderDeletion: null;
}

export const test = baseTest.extend<MoveFolderFixtures>({
    isUnique: true,
    parentFolder: null,
    collidingFolder: null,
    deletedFolderIds: async ({}, use) => use([]),

    mockFolderValidation: [
        async ({ mockedInvoker, folder, collidingFolder, isUnique }, use) => {
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

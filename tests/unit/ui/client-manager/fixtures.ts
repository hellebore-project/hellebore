import { expect, vi } from "vitest";

import type { Id } from "@/interface";
import type { FolderResponse, FolderValidateResponse } from "@/api";
import { test as baseTest } from "@tests/unit/ui/fixtures";
import {
    mockGetFolder,
    mockDeleteFolder,
    mockValidateFolder,
} from "@tests/utils/mocks";

export interface MoveFolderFixtures {
    isUnique: boolean;
    parentFolder: FolderResponse | null;
    collidingFolder: FolderResponse | null;
    deletedFolderIds: Id[];
    folderValidation: FolderValidateResponse;
    folderDeletion: null;
}

export const test = baseTest.extend<MoveFolderFixtures>({
    isUnique: true,
    parentFolder: null,
    collidingFolder: null,
    deletedFolderIds: async ({}, use) => use([]),

    folderValidation: [
        async ({ mockedInvoker, folder, collidingFolder, isUnique }, use) => {
            const response: FolderValidateResponse = {
                ...folder,
                id: folder.id,
                nameCollision: null,
            };

            if (!isUnique) {
                if (!collidingFolder) {
                    throw new Error("Colliding folder fixture is required");
                }

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
    folderDeletion: [
        async ({ mockedInvoker, deletedFolderIds }, use) => {
            mockDeleteFolder(mockedInvoker, deletedFolderIds, []);
            use(null);
        },
        { auto: true },
    ],
});

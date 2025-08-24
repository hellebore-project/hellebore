import { vi } from "vitest";

import { FolderResponse } from "@/schema";
import { FolderManager } from "@/services/domain";

export interface MockGetFoldersArguments {
    manager: FolderManager;
    folders: FolderResponse[];
}

export function mockGetFolders({ manager, folders }: MockGetFoldersArguments) {
    const spy = vi
        .spyOn(manager, "_getAll")
        .mockImplementation(async () => folders);
    return spy;
}

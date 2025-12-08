import { FolderResponse } from "@/domain/schema";
import { CommandNames } from "@/domain/constants";

import { MockedInvoker } from "./invoker";

export interface MockGetFoldersArgs {
    folders: FolderResponse[];
}

export function mockGetFolders(
    mockedInvoker: MockedInvoker,
    { folders }: MockGetFoldersArgs,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.GetAll, async () => folders);
}

import { FolderResponse } from "@/domain/schema";
import { CommandNames } from "@/domain/constants";

import { MockedInvoker } from "./invoker";

export interface MockGetFoldersArguments {
    folders: FolderResponse[];
}

export function mockGetFolders(
    mockedInvoker: MockedInvoker,
    { folders }: MockGetFoldersArguments,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.GetAll, async () => folders);
}

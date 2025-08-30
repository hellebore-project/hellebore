import { FolderResponse } from "@/schema";
import { MockedInvoker } from "./invoker";
import { CommandNames } from "@/constants";

export interface MockGetFoldersArguments {
    folders: FolderResponse[];
}

export function mockGetFolders(
    mockedInvoker: MockedInvoker,
    { folders }: MockGetFoldersArguments,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.GetAll, async () => folders);
}

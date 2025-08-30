import { FolderResponse } from "@/schema";
import { MockedInvoker } from "./invoker";

export interface MockGetFoldersArguments {
    folders: FolderResponse[];
}

export function mockGetFolders(
    mockedInvoker: MockedInvoker,
    { folders }: MockGetFoldersArguments,
) {
    mockedInvoker.mockCommand("get_folders", async () => folders);
}

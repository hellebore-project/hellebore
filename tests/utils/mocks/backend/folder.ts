import { FolderResponse } from "@/domain/schema";
import { CommandNames } from "@/domain/constants";

import { MockedInvoker } from "./invoker";

export function mockUpdateFolder(
    mockedInvoker: MockedInvoker,
    folder: FolderResponse,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.Update, async () => folder);
}

export function mockGetFolders(
    mockedInvoker: MockedInvoker,
    folders: FolderResponse[],
) {
    mockedInvoker.mockCommand(CommandNames.Folder.GetAll, async () => folders);
}

export function mockDeleteFolder(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand(CommandNames.Folder.Delete);
}

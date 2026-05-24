import { CommandNames } from "@/constants";
import {
    BulkFileResponse,
    DiagnosticResponse,
    FolderResponse,
    FolderUpsertResponse,
    FolderValidateResponse,
    Id,
} from "@/interface";

import { MockedInvoker } from "./invoker";

export function mockUpdateFolder(
    mockedInvoker: MockedInvoker,
    folder: FolderResponse,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.Update, async () => folder);
}

export function mockValidateFolder(
    mockedInvoker: MockedInvoker,
    response: FolderValidateResponse,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.Validate, async () => ({
        data: response,
    }));
}

export function mockGetFolder(
    mockedInvoker: MockedInvoker,
    folder: FolderResponse,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.Get, async () => folder);
}

export function mockGetFolders(
    mockedInvoker: MockedInvoker,
    folders: FolderResponse[],
) {
    mockedInvoker.mockCommand(CommandNames.Folder.GetAll, async () => folders);
}

export function mockDeleteFolder(
    mockedInvoker: MockedInvoker,
    folderIds: Id[],
    entryIds: Id[],
) {
    const response: BulkFileResponse = {
        entries: entryIds,
        folders: folderIds,
    };
    mockedInvoker.mockCommand(CommandNames.Folder.Delete, async () => response);
}

export function mockBulkUpsertFolders(
    mockedInvoker: MockedInvoker,
    responses: FolderUpsertResponse[],
) {
    const diagnostics: DiagnosticResponse<FolderUpsertResponse>[] =
        responses.map((data) => ({ data, errors: [] }));
    mockedInvoker.mockCommand(
        CommandNames.Folder.BulkUpsert,
        async () => diagnostics,
    );
}

import { Id } from "@/interface";
import {
    CommandNames,
    type BulkEntryResponse,
    type DiagnosticResponse,
    type FolderBulkUpdateData,
    type FolderResponse,
    type FolderValidateResponse,
} from "@/api";

import { MockedInvoker } from "./invoker";

export function mockUpdateFolder(
    mockedInvoker: MockedInvoker,
    data: FolderBulkUpdateData,
) {
    mockedInvoker.mockCommand(CommandNames.Folder.Update, async () => ({
        data,
        errors: [],
    }));
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
    const response: BulkEntryResponse = {
        entries: entryIds,
        folders: folderIds,
    };
    mockedInvoker.mockCommand(CommandNames.Folder.Delete, async () => response);
}

export function mockBulkUpdateFolders(
    mockedInvoker: MockedInvoker,
    responses: FolderBulkUpdateData[],
) {
    const diagnostics: DiagnosticResponse<FolderBulkUpdateData>[] =
        responses.map((data) => ({ data, errors: [] }));
    mockedInvoker.mockCommand(
        CommandNames.Folder.BulkUpdate,
        async () => diagnostics,
    );
}

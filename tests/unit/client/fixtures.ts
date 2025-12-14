import { cleanup } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { test as baseTest } from "vitest";

import { ClientManager, state } from "@/client";
import {
    EntityType,
    EntryInfoResponse,
    FolderResponse,
    ProjectResponse,
    SessionResponse,
} from "@/domain";
import { Id } from "@/interface";
import {
    MockedInvoker,
    mockGetEntries,
    mockGetFolder,
    mockGetFolders,
    mockGetSession,
} from "@tests/utils/mocks";

export interface BaseUnitTestFixtures {
    dbFilePath: string;
    project: ProjectResponse;
    session: SessionResponse;
    folderId: Id;
    parentFolderId: Id;
    folderName: string;
    folder: FolderResponse;
    folders: FolderResponse[];
    entryId: Id;
    entryType: EntityType;
    entryTitle: string;
    entryInfo: EntryInfoResponse;
    entries: EntryInfoResponse[];
    mockedInvoker: MockedInvoker;
    mockedSession: SessionResponse;
    mockedFolder: FolderResponse;
    mockedFolders: FolderResponse[];
    mockedEntries: EntryInfoResponse[];
    clientManager: ClientManager;
    user: UserEvent;
    setup: null;
}

// NOTE: the first argument inside a fixture must use the object destructuring pattern;
// don't get rid of the empty objects in the arrow functions below

export const test = baseTest.extend<BaseUnitTestFixtures>({
    // data
    dbFilePath: "mocked/db/file/path",
    project: { id: 1, name: "mocked-project" },
    session: async ({ dbFilePath, project }, use) => {
        const session: SessionResponse = {
            db_file_path: dbFilePath,
            project,
        };
        use(session);
    },

    folderId: 1,
    parentFolderId: -1,
    folderName: "mocked-folder",
    folder: async ({ folderId, parentFolderId, folderName }, use) => {
        const folder: FolderResponse = {
            id: folderId,
            parentId: parentFolderId,
            name: folderName,
        };
        use(folder);
    },
    folders: async ({ folder }, use) => {
        use([folder]);
    },

    entryId: 1,
    entryType: EntityType.ENTRY,
    entryTitle: "mocked-title",
    entryInfo: async ({ entryId, entryType, folderId, entryTitle }, use) => {
        const entry: EntryInfoResponse = {
            id: entryId,
            entity_type: entryType,
            folder_id: folderId,
            title: entryTitle,
        };
        use(entry);
    },
    entries: [
        [
            {
                id: 1,
                folder_id: -1,
                entity_type: EntityType.PERSON,
                title: "mocked-entity",
            },
        ],
        { injected: true },
    ],

    // mocking
    mockedInvoker: [
        async ({}, use) => {
            const invoker = new MockedInvoker();
            invoker.inject();
            await use(invoker);
        },
        { auto: true },
    ],
    mockedSession: async ({ mockedInvoker, session }, use) => {
        mockGetSession(mockedInvoker, {
            dbFilePath: session.db_file_path,
            project: session.project,
        });
        await use(session);
    },
    mockedFolder: async ({ mockedInvoker, folder }, use) => {
        mockGetFolder(mockedInvoker, folder);
        await use(folder);
    },
    mockedFolders: async ({ mockedInvoker, folders }, use) => {
        mockGetFolders(mockedInvoker, folders);
        await use(folders);
    },
    mockedEntries: async ({ mockedInvoker, entries: entities }, use) => {
        mockGetEntries(mockedInvoker, { entities });
        await use(entities);
    },

    user: [
        async ({}, use) => {
            await use(userEvent.setup());
        },
        { auto: true },
    ],

    // services
    clientManager: [
        async (
            {
                mockedInvoker,
                dbFilePath,
                project,
                mockedSession,
                mockedFolders,
                mockedEntries,
            },
            use,
        ) => {
            const clientManager = new ClientManager();
            await clientManager.load();
            state.manager = clientManager;

            await use(clientManager);
            state.manager = null;
        },
        { auto: true },
    ],

    // setup and teardown
    setup: [
        async ({ mockedInvoker, user, clientManager }, use) => {
            await use(null);

            mockedInvoker.clear();
            cleanup();
        },
        { auto: true },
    ],
});

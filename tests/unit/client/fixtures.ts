import { cleanup } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { JSONContent } from "@tiptap/core";
import { test as baseTest } from "vitest";

import { ClientManager, state } from "@/client";
import {
    EntityType,
    EntryArticleResponse,
    EntryInfoResponse,
    EntryType,
    FolderResponse,
    ProjectResponse,
    SessionResponse,
} from "@/domain";
import { Id } from "@/interface";
import {
    createDocNode,
    createParagraphNode,
    createTextNode,
    MockedInvoker,
    mockGetEntries,
    mockGetEntryArticle,
    mockGetEntryInfo,
    mockGetFolder,
    mockGetFolders,
    mockGetSession,
    mockSearchEntries,
} from "@tests/utils/mocks";

export interface BaseUnitTestFixtures {
    dbFilePath: string;
    project: ProjectResponse;
    session: SessionResponse;
    folderId: Id;
    parentFolderId: Id;
    folderName: string;
    folder: FolderResponse;
    otherFolders: FolderResponse[];
    allFolders: FolderResponse[];
    entryId: Id;
    entryType: EntityType;
    entryTitle: string;
    entryArticleText: string;
    entryArticle: JSONContent;
    entryInfo: EntryInfoResponse;
    otherEntries: EntryInfoResponse[];
    allEntries: EntryInfoResponse[];
    mockedInvoker: MockedInvoker;
    mockedSession: SessionResponse;
    mockedFolder: FolderResponse;
    mockedFolders: FolderResponse[];
    mockedEntryInfo: EntryInfoResponse;
    mockedEntryArticle: EntryArticleResponse;
    mockedEntries: EntryInfoResponse[];
    mockedSearchedEntries: EntryInfoResponse[];
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
            dbFilePath,
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
    otherFolders: async ({}, use) => use([]),
    allFolders: async ({ folder, otherFolders }, use) => {
        use([folder, ...otherFolders]);
    },

    entryId: 1,
    entryType: EntityType.ENTRY,
    entryTitle: "mocked-title",
    entryArticleText: "mocked article text",
    entryArticle: async ({ entryArticleText }, use) => {
        const articleContent = createDocNode([
            createParagraphNode([createTextNode(entryArticleText)]),
        ]);
        use(articleContent);
    },
    entryInfo: async ({ entryId, entryType, folderId, entryTitle }, use) => {
        const entry: EntryInfoResponse = {
            id: entryId,
            // TODO: remove cast once generic entries are supported
            entityType: entryType as unknown as EntryType,
            folderId,
            title: entryTitle,
        };
        use(entry);
    },
    otherEntries: async ({}, use) => use([]),
    allEntries: async ({ entryInfo, otherEntries }, use) => {
        use([entryInfo, ...otherEntries]);
    },

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
            dbFilePath: session.dbFilePath,
            project: session.project,
        });
        await use(session);
    },
    mockedFolder: async ({ mockedInvoker, folder }, use) => {
        mockGetFolder(mockedInvoker, folder);
        await use(folder);
    },
    mockedFolders: async ({ mockedInvoker, allFolders }, use) => {
        mockGetFolders(mockedInvoker, allFolders);
        await use(allFolders);
    },
    mockedEntryInfo: async ({ mockedInvoker, entryInfo }, use) => {
        mockGetEntryInfo(mockedInvoker, entryInfo);
        use(entryInfo);
    },
    mockedEntryArticle: async (
        { mockedInvoker, mockedEntryInfo, entryArticle },
        use,
    ) => {
        const entryWithArticle: EntryArticleResponse = {
            info: mockedEntryInfo,
            text: entryArticle,
        };
        mockGetEntryArticle(mockedInvoker, entryWithArticle);
        use(entryWithArticle);
    },
    mockedEntries: async ({ mockedInvoker, allEntries }, use) => {
        mockGetEntries(mockedInvoker, allEntries);
        await use(allEntries);
    },
    mockedSearchedEntries: async ({ mockedInvoker, allEntries }, use) => {
        mockSearchEntries(mockedInvoker, allEntries);
        use(allEntries);
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
        },
        { auto: true },
    ],

    // setup and teardown
    setup: [
        async ({ user, mockedInvoker, clientManager }, use) => {
            await use(null);

            mockedInvoker.clear();
            cleanup();
        },
        { auto: true },
    ],
});

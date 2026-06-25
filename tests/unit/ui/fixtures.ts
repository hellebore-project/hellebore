import type { JSONContent } from "@tiptap/core";
import { NIL as NIL_UUID } from "uuid";

import type { Id } from "@/interface";
import {
    type EntryArticleResponse,
    type EntryInfoResponse,
    type FolderResponse,
    type ProjectResponse,
    DomainManager,
    EntryType,
} from "@/api";
import { ClientData } from "@/models";
import { ClientManager } from "@/ui";
import {
    createDocNode,
    createParagraphNode,
    createTextNode,
    MockedInvoker,
    mockBulkUpdateEntries,
    mockBulkUpdateFolders,
    mockGetEntries,
    mockGetEntryArticle,
    mockGetEntryInfo,
    mockGetFolder,
    mockGetFolders,
    mockLoadProject,
    mockSearchEntries,
} from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BaseUiFixtures {
    project: ProjectResponse;
    folderId: Id;
    parentFolderId: Id;
    folderName: string;
    folder: FolderResponse;
    otherFolders: FolderResponse[];
    allFolders: FolderResponse[];
    entryId: Id;
    entryType: EntryType;
    entryTitle: string;
    entryArticleText: string;
    entryArticle: JSONContent;
    entryInfo: EntryInfoResponse;
    otherEntries: EntryInfoResponse[];
    allEntries: EntryInfoResponse[];
    mockedInvoker: MockedInvoker;
    mockedProject: ProjectResponse;
    mockedFolder: FolderResponse;
    mockedFolders: FolderResponse[];
    mockedEntryInfo: EntryInfoResponse;
    mockedEntryArticle: EntryArticleResponse;
    mockedEntries: EntryInfoResponse[];
    mockedSearchedEntries: EntryInfoResponse[];
    mockedBulkEntryUpdate: null;
    mockedBulkFolderUpdate: null;
    clientData: ClientData;
    domainManager: DomainManager;
    clientManager: ClientManager;
    clientContext: null;
}

export const test = baseTest.extend<BaseUiFixtures>({
    project: { id: "test-project-id", name: "mocked-project" },

    folderId: "folder",
    parentFolderId: NIL_UUID,
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

    entryId: "entry",
    entryType: EntryType.Person,
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
            entityType: entryType,
            folderId,
            title: entryTitle,
        };
        use(entry);
    },
    otherEntries: async ({}, use) => use([]),
    allEntries: async ({ entryInfo, otherEntries }, use) => {
        use([entryInfo, ...otherEntries]);
    },

    mockedInvoker: [
        async ({}, use) => {
            const invoker = new MockedInvoker();
            invoker.inject();
            await use(invoker);
        },
        { auto: true },
    ],
    mockedProject: async ({ mockedInvoker, project }, use) => {
        mockLoadProject(mockedInvoker, project);
        await use(project);
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
    mockedBulkEntryUpdate: async ({ mockedInvoker }, use) => {
        mockBulkUpdateEntries(mockedInvoker);
        await use(null);
    },
    mockedBulkFolderUpdate: async ({ mockedInvoker }, use) => {
        mockBulkUpdateFolders(mockedInvoker, []);
        await use(null);
    },

    clientData: async ({ mockedProject }, use) => {
        const project = new ClientData();
        project.setProject(mockedProject);
        await use(project);
    },

    domainManager: async ({}, use) => {
        const domain = new DomainManager();
        await use(domain);
    },

    clientManager: [
        async (
            {
                mockedProject,
                mockedFolders,
                mockedEntries,
                mockedBulkEntryUpdate,
                mockedBulkFolderUpdate,
            },
            use,
        ) => {
            const clientManager = new ClientManager();
            await clientManager.load();
            await use(clientManager);
        },
        { auto: true },
    ],

    clientContext: [
        async ({ context, user, mockedInvoker, clientManager }, use) => {
            await use(null);

            clientManager.cleanUp();
        },
        { auto: true },
    ],
});

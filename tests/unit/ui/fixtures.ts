import type { JSONContent } from "@tiptap/core";
import { NIL as NIL_UUID } from "uuid";

import type { Id } from "@/interface";
import {
    type EntryArticleResponse,
    type EntryInfoResponse,
    type FolderResponse,
    type ProjectResponse,
    DomainManager,
    ENTRY_TYPE_LABEL_MAPPING,
    EntryPropertyResponse,
    EntryType,
    PersonProperties,
    WordResponse,
    WordType,
} from "@/api";
import { ClientData } from "@/models";
import { ClientManager, SynchronizationService } from "@/ui";
import {
    createDocNode,
    createParagraphNode,
    createTextNode,
    MockedInvoker,
    mockBulkUpdateEntries,
    mockBulkUpdateFolders,
    mockGetEntryArticle,
    mockGetEntryInfo,
    mockListEntries,
    mockGetFolder,
    mockGetFolders,
    mockLoadProject,
    mockGetEntryProperties,
} from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BaseUiFixtures {
    projectId: Id;
    projectName: string;
    project: ProjectResponse;

    folderId: Id;
    parentFolderId: Id;
    folderName: string;
    folder: FolderResponse;
    otherFolders: FolderResponse[];
    allFolders: FolderResponse[];

    entryId: Id;
    entryType: EntryType;
    entryTypeLabel: string;
    entryTitle: string;
    entryArticleText: string;
    entryArticle: JSONContent;
    entryInfo: EntryInfoResponse;
    otherEntries: EntryInfoResponse[];
    allEntries: EntryInfoResponse[];

    languageId: Id;
    wordId: Id;
    wordKey: string;
    wordType: WordType;
    wordSpelling: string;
    wordDefinition: string;
    wordTranslations: string[];
    word: WordResponse;
    words: WordResponse[];

    mockedInvoker: MockedInvoker;
    mockedProject: ProjectResponse;
    mockedFolder: FolderResponse;
    mockedFolders: FolderResponse[];
    mockedEntryInfo: EntryInfoResponse;
    mockedEntryArticle: EntryArticleResponse;
    entryProperties: PersonProperties;
    mockedEntryProperties: EntryPropertyResponse;
    mockedEntries: EntryInfoResponse[];
    mockedSearchedEntries: EntryInfoResponse[];
    mockedBulkEntryUpdate: null;
    mockedBulkFolderUpdate: null;

    clientData: ClientData;
    clientManager: ClientManager;
    domainManager: DomainManager;
    synchronizer: SynchronizationService;
    clientContext: null;
}

export const test = baseTest.extend<BaseUiFixtures>({
    // PROJECT
    projectId: "test-project-id",
    projectName: "mocked-project",
    project: async ({ projectId, projectName }, use) => {
        await use({
            id: projectId,
            name: projectName,
        });
    },

    // FOLDER
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

    // ENTRY
    entryId: "entry",
    entryType: EntryType.Person,
    entryTypeLabel: async ({ entryType }, use) =>
        await use(ENTRY_TYPE_LABEL_MAPPING[entryType]),
    entryTitle: "Dog",
    entryArticleText: "mocked article text",
    entryArticle: async ({ entryArticleText }, use) => {
        const articleContent = createDocNode([
            createParagraphNode([createTextNode(entryArticleText)]),
        ]);
        use(articleContent);
    },
    entryProperties: async ({}, use) => use({ name: "Dante" }),
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

    // WORD
    languageId: async ({ entryId }, use) => await use(entryId),
    wordId: "word1",
    wordKey: async ({ wordId }, use) => await use(wordId),
    wordType: WordType.Noun,
    wordSpelling: "alpha",
    wordDefinition: "first",
    wordTranslations: ["one", "single"],
    word: async (
        {
            languageId,
            wordId,
            wordType,
            wordSpelling,
            wordDefinition,
            wordTranslations,
        },
        use,
    ) => {
        const word: WordResponse = {
            id: wordId,
            languageId,
            wordType,
            spelling: wordSpelling,
            definition: wordDefinition,
            translations: wordTranslations,
        };
        await use(word);
    },
    words: async ({ word }, use) => {
        await use([word]);
    },

    // MOCKS
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
    mockedEntryProperties: async (
        { mockedInvoker, mockedEntryInfo, entryProperties },
        use,
    ) => {
        const entryWithProperties: EntryPropertyResponse = {
            info: mockedEntryInfo,
            properties: entryProperties,
        };
        mockGetEntryProperties(mockedInvoker, entryWithProperties);
        await use(entryWithProperties);
    },
    mockedEntries: async ({ mockedInvoker, allEntries }, use) => {
        mockListEntries(mockedInvoker, allEntries);
        await use(allEntries);
    },
    mockedSearchedEntries: async ({ mockedInvoker, allEntries }, use) => {
        mockListEntries(mockedInvoker, allEntries);
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

    // CLIENT
    clientData: async ({ mockedProject }, use) => {
        const project = new ClientData();
        project.setProject(mockedProject);
        await use(project);
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
    domainManager: async ({ clientManager }, use) => {
        await use(clientManager.domain);
    },
    synchronizer: async ({ clientManager }, use) => {
        await use(clientManager.synchronizer);
    },
    clientContext: [
        async ({ context, user, mockedInvoker, clientManager }, use) => {
            await use(null);

            clientManager.cleanUp();
        },
        { auto: true },
    ],
});

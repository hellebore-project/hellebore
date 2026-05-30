import { test as baseTest, vi } from "vitest";

import {
    type EntryInfoResponse,
    type FolderResponse,
    type ProjectResponse,
    type SessionResponse,
    type WordUpsert,
    EntryType,
    WordType,
    EntryManager,
    FolderManager,
    SessionManager,
    WordManager,
} from "@/api";
import { MockedInvoker } from "@tests/utils/mocks";

interface DomainServiceFixtures {
    mockedInvoker: MockedInvoker;
    sessionManager: SessionManager;
    folderManager: FolderManager;
    entryManager: EntryManager;
    wordManager: WordManager;
    project: ProjectResponse;
    session: SessionResponse;
    folder: FolderResponse;
    entry: EntryInfoResponse;
    words: WordUpsert[];
    cleanup: null;
}

export const test = baseTest.extend<DomainServiceFixtures>({
    mockedInvoker: async ({}, use) => {
        const invoker = new MockedInvoker();
        invoker.inject();
        await use(invoker);
    },

    sessionManager: async ({}, use) => {
        await use(new SessionManager());
    },
    folderManager: async ({}, use) => {
        await use(new FolderManager());
    },
    entryManager: async ({}, use) => {
        await use(new EntryManager());
    },
    wordManager: async ({}, use) => {
        await use(new WordManager());
    },

    project: {
        id: 1,
        name: "mocked-project",
    },
    session: async ({ project }, use) => {
        await use({
            folderPath: "/tmp/mock-project",
            project,
        });
    },
    folder: {
        id: 10,
        parentId: -1,
        name: "mocked-folder",
    },
    entry: {
        id: 100,
        entityType: EntryType.Person,
        folderId: 10,
        title: "mocked-entry",
    },
    words: [
        {
            id: 1,
            languageId: 100,
            wordType: WordType.Noun,
            spelling: "river",
            definition: "a natural stream",
            translations: ["rio"],
        },
    ],

    cleanup: [
        async ({ mockedInvoker }, use) => {
            await use(null);
            mockedInvoker.clear();
            vi.restoreAllMocks();
        },
        { auto: true },
    ],
});

import { expect } from "vitest";

import { CommandNames, EntryType } from "@/api";
import { SyncType } from "@/constants";
import type {
    PollResult,
    PollResultEntryData,
    PollResultFolderData,
    PollResultProjectData,
    Word,
} from "@/interface";
import {
    mockBulkUpdateEntries,
    mockBulkUpdateFolders,
    mockUpdateProject,
} from "@tests/utils/mocks";

import { test as baseTest } from "./fixtures";

interface SynchronizerFixtures {
    projectPollResult: PollResultProjectData | undefined;
    folderPollResult: PollResultFolderData | undefined;
    folderPollResults: PollResultFolderData[] | undefined;
    entryPollResult: PollResultEntryData | undefined;
    entryPollResults: PollResultEntryData[] | undefined;
    wordPollResult: Word | undefined;
    wordPollResults: Word[] | undefined;
    pollResult: PollResult;

    mockedPollResult: PollResult;
}

const test = baseTest
    .extend<SynchronizerFixtures>({
        projectPollResult: async ({ project }, use) => {
            await use({ ...project });
        },
        folderPollResult: async ({ folder }, use) => {
            await use({ ...folder });
        },
        folderPollResults: async ({ folderPollResult }, use) => {
            await use(folderPollResult ? [folderPollResult] : undefined);
        },
        entryPollResult: async (
            { entryInfo, entryArticleText, entryProperties, wordPollResults },
            use,
        ) => {
            await use({
                id: entryInfo.id,
                entryType: entryInfo.entityType,
                folderId: entryInfo.folderId,
                title: entryInfo.title,
                properties: entryProperties,
                text: entryArticleText,
                words: wordPollResults,
            });
        },
        entryPollResults: async ({ entryPollResult }, use) => {
            await use(entryPollResult ? [entryPollResult] : undefined);
        },
        wordPollResult: async ({ word, wordKey }, use) => {
            await use({
                ...word,
                key: wordKey,
            });
        },
        wordPollResults: async ({ wordPollResult }, use) => {
            await use(wordPollResult ? [wordPollResult] : undefined);
        },
        pollResult: async (
            { projectPollResult, folderPollResults, entryPollResults },
            use,
        ) => {
            await use({
                project: projectPollResult,
                entries: entryPollResults,
                folders: folderPollResults,
            });
        },

        mockedPollResult: async ({ synchronizer, pollResult }, use) => {
            synchronizer.poll.subscribe(() => {
                return pollResult;
            });

            await use(pollResult);
        },
    })
    .override({
        synchronizer: async ({ clientManager, pollResult }, use) => {
            const synchronizer = clientManager.synchronizer;

            synchronizer.poll.subscribe(() => {
                return pollResult;
            });

            await use(synchronizer);
        },
    });

test.extend({
    pollResult: async ({ projectPollResult }, use) => {
        await use({ project: projectPollResult });
    },
})(
    "periodic sync",
    async ({ synchronizer, mockedInvoker, mockedPollResult, project }) => {
        mockUpdateProject(mockedInvoker, { ...project });

        synchronizer.requestPeriodicSynchronization();

        mockedInvoker.expectNotCalled(CommandNames.Project.Update);

        // Wait for the synchronization logic to complete
        await new Promise((resolve) =>
            setTimeout(resolve, synchronizer.DEFAULT_SYNC_PERIOD + 10),
        );

        mockedInvoker.expectCalled(CommandNames.Project.Update);
    },
    10000,
);

test.extend({
    pollResult: async ({ projectPollResult }, use) => {
        await use({ project: projectPollResult });
    },
})(
    "full sync debounces a periodic sync",
    async ({ synchronizer, mockedInvoker, mockedPollResult, project }) => {
        mockUpdateProject(mockedInvoker, {
            id: "test-project-id",
            name: "mocked-project",
        });

        let resolved = false;
        const periodicSyncPromise =
            synchronizer.requestPeriodicSynchronization();
        expect(periodicSyncPromise).not.toBeNull();
        const flaggedPeriodicSyncPromise = periodicSyncPromise?.then(() => {
            resolved = true;
        });

        expect(resolved).toBe(false);
        const fullSyncPromise = synchronizer.requestFullSynchronization();
        const fullSync = await fullSyncPromise;
        expect(fullSync).not.toBeNull();
        expect(fullSync?.project).toBeTruthy();

        expect(resolved).toBe(false);
        await flaggedPeriodicSyncPromise;
        expect(resolved).toBe(true);
    },
    10000,
);

test.extend({
    pollResult: async ({ projectPollResult }, use) => {
        await use({ project: projectPollResult });
    },
})(
    "sync project",
    async ({ synchronizer, mockedInvoker, mockedPollResult, project }) => {
        mockUpdateProject(mockedInvoker, { ...project });

        const event = await synchronizer.requestFullSynchronization();

        mockedInvoker.expectCalledWith(CommandNames.Project.Update, {
            id: project.id,
            name: project.name,
        });
        expect(event?.project).toStrictEqual({
            request: {
                id: project.id,
                name: project.name,
            },
            response: { project },
        });
    },
);

test.extend({
    parentFolderId: "folder2",
    folderName: "renamed-folder",
    pollResult: async ({ folderPollResults }, use) => {
        await use({ folders: folderPollResults });
    },
})(
    "sync folder",
    async ({
        synchronizer,
        mockedInvoker,
        mockedPollResult,
        projectId,
        folder,
    }) => {
        mockBulkUpdateFolders(mockedInvoker, [
            {
                id: folder.id,
                parentChanged: true,
                nameChanged: true,
            },
        ]);

        const event = await synchronizer.requestFullSynchronization();

        mockedInvoker.expectCalledWith(CommandNames.Folder.BulkUpdate, {
            projectId,
            folders: [
                { id: folder.id, parentId: folder.parentId, name: folder.name },
            ],
        });
        expect(event?.folders).toStrictEqual([
            {
                request: {
                    id: folder.id,
                    parentId: folder.parentId,
                    name: folder.name,
                },
                response: {
                    folder: {
                        id: folder.id,
                        parentId: folder.parentId,
                        name: folder.name,
                        parentChanged: true,
                        nameChanged: true,
                    },
                },
            },
        ]);
    },
);

test.extend({
    entryType: EntryType.Language,
    entryProperties: async ({}, use) => await use({}),
    pollResult: async ({ entryPollResults }, use) => {
        await use({ entries: entryPollResults });
    },
})(
    "sync language entry",
    async ({
        synchronizer,
        mockedInvoker,
        mockedPollResult,
        projectId,
        entryInfo,
        entryTypeLabel,
        entryArticleText,
        entryProperties,
        words,
        wordPollResults,
    }) => {
        mockBulkUpdateEntries(mockedInvoker);

        const event = await synchronizer.requestSynchronization({
            type: SyncType.FULL,
        });

        mockedInvoker.expectCalledWith(CommandNames.Entry.BulkUpdate, {
            projectId,
            entries: [
                {
                    id: entryInfo.id,
                    folderId: entryInfo.folderId,
                    title: entryInfo.title,
                    properties: { [entryTypeLabel]: {} },
                    text: entryArticleText,
                    words: wordPollResults,
                },
            ],
        });
        expect(event?.entries).toStrictEqual([
            {
                request: {
                    id: entryInfo.id,
                    entryType: entryInfo.entityType,
                    folderId: entryInfo.folderId,
                    title: entryInfo.title,
                    text: entryArticleText,
                    properties: entryProperties,
                    words: wordPollResults,
                },
                response: {
                    entry: {
                        id: entryInfo.id,
                        folderId: { updated: true },
                        title: { isUnique: true, updated: true },
                        text: { updated: true },
                        properties: { updated: true },
                        words: [
                            {
                                id: wordPollResults?.[0].id,
                                status: {
                                    created: false,
                                    updated: true,
                                },
                            },
                        ],
                    },
                },
            },
        ]);
    },
);

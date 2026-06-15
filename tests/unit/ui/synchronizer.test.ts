import { describe, vi, afterEach, expect } from "vitest";

import { CommandNames } from "@/api";
import { SyncType } from "@/constants";
import type { PollEvent } from "@/interface";
import type { ClientManager } from "@/ui";
import { SynchronizationService } from "@/ui/synchronizer";
import { test as baseTest } from "@tests/unit/ui/fixtures";
import {
    mockBulkUpdateEntries,
    mockBulkUpdateFolders,
    mockUpdateProject,
} from "@tests/utils/mocks";

const test = baseTest;

vi.mock("@/utils/event-producer", () => {
    class MockEventProducer {
        produce: ReturnType<typeof vi.fn>;

        constructor() {
            this.produce = vi.fn().mockReturnValue({
                project: { name: "mockProject" },
                entries: [{ id: "mockEntry", entryType: "mockType" }],
            });
        }
    }

    class MockMultiEventProducer {
        produce: ReturnType<typeof vi.fn>;

        constructor() {
            this.produce = vi.fn();
        }
    }

    return {
        EventProducer: MockEventProducer,
        MultiEventProducer: MockMultiEventProducer,
    };
});

describe("SynchronizationService", () => {
    test.scoped({
        clientManager: [
            async ({}, use) => {
                await use({ cleanUp: () => undefined } as ClientManager);
            },
            { auto: true },
        ],
        setup: [
            async ({}, use) => {
                await use(null);
            },
            { auto: true },
        ],
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should gate periodic/full syncs based on timing", async ({
        domainManager,
        projectState,
        mockedInvoker,
    }) => {
        const syncService = new SynchronizationService(
            domainManager,
            projectState,
        );
        mockUpdateProject(mockedInvoker, {
            id: "test-project-id",
            name: "mocked-project",
        });
        mockBulkUpdateFolders(mockedInvoker, []);
        mockBulkUpdateEntries(mockedInvoker);

        await syncService.requestPeriodicSynchronization();

        // Wait for the synchronization logic to complete
        await new Promise((resolve) =>
            setTimeout(resolve, syncService.DEFAULT_SYNC_PERIOD + 10),
        );

        mockedInvoker.expectCalled(CommandNames.Project.Update);
    }, 10000); // Increase timeout to 10 seconds

    test("should debounce/skip sync requests appropriately", async ({
        domainManager,
        projectState,
        mockedInvoker,
    }) => {
        const syncService = new SynchronizationService(
            domainManager,
            projectState,
        );
        mockUpdateProject(mockedInvoker, {
            id: "test-project-id",
            name: "mocked-project",
        });
        mockBulkUpdateFolders(mockedInvoker, []);
        mockBulkUpdateEntries(mockedInvoker);

        const pollEvent: PollEvent = { type: SyncType.FULL };
        const canSkipSyncSpy = vi.spyOn(syncService, "canSkipSync");

        await syncService.requestSynchronization(pollEvent);
        expect(canSkipSyncSpy).toHaveBeenCalledWith(pollEvent);
    });

    test("should handle producer events correctly", async ({
        domainManager,
        projectState,
        mockedInvoker,
    }) => {
        const syncService = new SynchronizationService(
            domainManager,
            projectState,
        );
        mockUpdateProject(mockedInvoker, {
            id: "test-project-id",
            name: "mocked-project",
        });
        mockBulkUpdateFolders(mockedInvoker, []);
        mockBulkUpdateEntries(mockedInvoker);

        const onPollSpy = vi.spyOn(syncService.onPoll, "produce");
        const pollEvent: PollEvent = { type: SyncType.FULL };

        await syncService.requestSynchronization(pollEvent);
        expect(onPollSpy).toHaveBeenCalledWith(pollEvent);
    });

    test("should sync folder updates through the backend", async ({
        domainManager,
        projectState,
        mockedInvoker,
    }) => {
        const syncService = new SynchronizationService(
            domainManager,
            projectState,
        );
        vi.spyOn(syncService.onPoll, "produce").mockReturnValue({
            entries: [],
            folders: [
                { id: "entry7", parentId: "entry3", name: "renamed folder" },
            ],
        });

        mockBulkUpdateEntries(mockedInvoker);
        mockBulkUpdateFolders(mockedInvoker, [
            {
                id: "entry7",
                parentChanged: false,
                nameChanged: true,
            },
        ]);

        const event = await syncService.requestSynchronization({
            type: SyncType.FULL,
        });

        mockedInvoker.expectCalledWith(CommandNames.Folder.BulkUpdate, {
            projectId: projectState.projectId!,
            folders: [
                { id: "entry7", parentId: "entry3", name: "renamed folder" },
            ],
        });
        expect(event?.folders).toStrictEqual([
            {
                request: {
                    id: "entry7",
                    parentId: "entry3",
                    name: "renamed folder",
                },
                response: {
                    folder: {
                        id: "entry7",
                        parentId: "entry3",
                        name: "renamed folder",
                        parentChanged: false,
                        nameChanged: true,
                    },
                },
            },
        ]);
    });

    test("should clean up fake timers and listeners", async ({
        domainManager,
        projectState,
        mockedInvoker,
    }) => {
        const syncService = new SynchronizationService(
            domainManager,
            projectState,
        );
        mockUpdateProject(mockedInvoker, {
            id: "test-project-id",
            name: "mocked-project",
        });
        mockBulkUpdateFolders(mockedInvoker, []);
        mockBulkUpdateEntries(mockedInvoker);

        vi.useFakeTimers(); // Use fake timers explicitly for this test

        syncService.requestPeriodicSynchronization();
        vi.advanceTimersByTime(syncService.DEFAULT_SYNC_PERIOD);

        vi.useRealTimers(); // Restore real timers after the test
        expect(() => vi.advanceTimersByTime(1000)).toThrow();
    });
});

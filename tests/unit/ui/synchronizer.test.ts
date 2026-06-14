import { describe, vi, beforeEach, afterEach, expect } from "vitest";

import { SyncType } from "@/constants";
import { PollEvent } from "@/interface";
import { SynchronizationService } from "@/ui/synchronizer";
import type { ClientManager } from "@/ui";
import { test as baseTest } from "@tests/unit/ui/fixtures";

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
    }) => {
        const syncService = new SynchronizationService(domainManager);
        const updateProjectSpy = vi
            .spyOn(domainManager.projects, "updateProject")
            .mockResolvedValue({
                id: "test-project-id",
                name: "mocked-project",
            });
        await syncService.requestPeriodicSynchronization();

        // Wait for the synchronization logic to complete
        await new Promise((resolve) =>
            setTimeout(resolve, syncService.DEFAULT_SYNC_PERIOD + 10),
        );

        expect(updateProjectSpy).toHaveBeenCalled();
    }, 10000); // Increase timeout to 10 seconds

    test("should debounce/skip sync requests appropriately", async ({
        domainManager,
    }) => {
        const syncService = new SynchronizationService(domainManager);
        const pollEvent: PollEvent = { type: SyncType.FULL };
        const canSkipSyncSpy = vi.spyOn(syncService, "canSkipSync");

        syncService.requestSynchronization(pollEvent);
        expect(canSkipSyncSpy).toHaveBeenCalledWith(pollEvent);
    });

    test("should handle producer events correctly", async ({
        domainManager,
    }) => {
        const syncService = new SynchronizationService(domainManager);
        const onPollSpy = vi.spyOn(syncService.onPoll, "produce");
        const pollEvent: PollEvent = { type: SyncType.FULL };

        syncService.requestSynchronization(pollEvent);
        expect(onPollSpy).toHaveBeenCalledWith(pollEvent);
    });

    test("should sync folder updates through the backend", async ({
        domainManager,
    }) => {
        const syncService = new SynchronizationService(domainManager);
        vi.spyOn(syncService.onPoll, "produce").mockReturnValue({
            entries: [],
            folders: [{ id: 7, parentId: 3, name: "renamed folder" }],
        });

        const bulkUpdateSpy = vi
            .spyOn(domainManager.loadedProject.folders, "bulkUpdate")
            .mockResolvedValueOnce([
                {
                    id: 7,
                    parentId: 3,
                    name: "renamed folder",
                    parentChanged: false,
                    nameChanged: true,
                },
            ]);

        const event = await syncService.requestSynchronization({
            type: SyncType.FULL,
        });

        expect(bulkUpdateSpy).toHaveBeenCalledWith([
            { id: 7, parentId: 3, name: "renamed folder" },
        ]);
        expect(event?.folders).toStrictEqual([
            {
                request: { id: 7, parentId: 3, name: "renamed folder" },
                response: {
                    folder: {
                        id: 7,
                        parentId: 3,
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
    }) => {
        const syncService = new SynchronizationService(domainManager);
        vi.useFakeTimers(); // Use fake timers explicitly for this test

        syncService.requestPeriodicSynchronization();
        vi.advanceTimersByTime(syncService.DEFAULT_SYNC_PERIOD);

        vi.useRealTimers(); // Restore real timers after the test
        expect(() => vi.advanceTimersByTime(1000)).toThrow();
    });
});

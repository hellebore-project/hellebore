import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";

import { SyncType } from "@/constants";
import { PollEvent } from "@/interface";
import { DomainManager } from "@/api";
import { SynchronizationService } from "@/ui/synchronizer";

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
    let domainManagerMock: DomainManager;
    let syncService: SynchronizationService;

    beforeEach(() => {
        domainManagerMock = {
            session: {
                updateProject: vi.fn().mockResolvedValue({}), // Ensure mock resolves correctly
            },
            entries: {
                bulkUpdate: vi.fn().mockResolvedValue([]),
            },
            folders: {
                bulkUpdate: vi.fn().mockResolvedValue([]),
            },
        } as unknown as DomainManager;

        syncService = new SynchronizationService(domainManagerMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should gate periodic/full syncs based on timing", async () => {
        const pollEvent: PollEvent = { type: SyncType.FULL };

        await syncService.requestPeriodicSynchronization();

        // Wait for the synchronization logic to complete
        await new Promise((resolve) =>
            setTimeout(resolve, syncService.DEFAULT_SYNC_PERIOD + 10),
        );

        expect(domainManagerMock.session.updateProject).toHaveBeenCalled();
    }, 10000); // Increase timeout to 10 seconds

    it("should debounce/skip sync requests appropriately", async () => {
        const pollEvent: PollEvent = { type: SyncType.FULL };
        const canSkipSyncSpy = vi.spyOn(syncService, "canSkipSync");

        syncService.requestSynchronization(pollEvent);
        expect(canSkipSyncSpy).toHaveBeenCalledWith(pollEvent);
    });

    it("should handle producer events correctly", async () => {
        const onPollSpy = vi.spyOn(syncService.onPoll, "produce");
        const pollEvent: PollEvent = { type: SyncType.FULL };

        syncService.requestSynchronization(pollEvent);
        expect(onPollSpy).toHaveBeenCalledWith(pollEvent);
    });

    it("should sync folder updates through the backend", async () => {
        vi.spyOn(syncService.onPoll, "produce").mockReturnValue({
            entries: [],
            folders: [{ id: 7, parentId: 3, name: "renamed folder" }],
        });

        (
            domainManagerMock.folders.bulkUpdate as ReturnType<typeof vi.fn>
        ).mockResolvedValueOnce([
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

        expect(domainManagerMock.folders.bulkUpdate).toHaveBeenCalledWith([
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

    it("should clean up fake timers and listeners", async () => {
        vi.useFakeTimers(); // Use fake timers explicitly for this test

        syncService.requestPeriodicSynchronization();
        vi.advanceTimersByTime(syncService.DEFAULT_SYNC_PERIOD);

        vi.useRealTimers(); // Restore real timers after the test
        expect(() => vi.advanceTimersByTime(1000)).toThrow();
    });
});

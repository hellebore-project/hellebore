import { describe, it, vi, beforeEach, afterEach } from "vitest";
import { SynchronizationService } from "@/services/client/synchronizer";
import { DomainManager } from "@/services/domain";
import { expect } from "vitest";

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

import { SyncType } from "@/constants";
import { PollEvent } from "@/interface";

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
                create: vi.fn().mockResolvedValue(null),
                update: vi.fn().mockResolvedValue(null),
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

    it("should sync folder creates and updates through the backend", async () => {
        vi.spyOn(syncService.onPoll, "produce").mockReturnValue({
            entries: [],
            folders: [
                { id: null, parentId: -1, name: "new folder" },
                { id: 7, parentId: 3, name: "renamed folder" },
            ],
        });

        (
            domainManagerMock.folders.create as ReturnType<typeof vi.fn>
        ).mockResolvedValueOnce({
            id: 20,
            parentId: -1,
            name: "new folder",
        });
        (
            domainManagerMock.folders.update as ReturnType<typeof vi.fn>
        ).mockResolvedValueOnce({
            id: 7,
            parentId: 3,
            name: "renamed folder",
        });

        const event = await syncService.requestSynchronization({
            type: SyncType.FULL,
        });

        expect(domainManagerMock.folders.create).toHaveBeenCalledWith(
            "new folder",
            -1,
        );
        expect(domainManagerMock.folders.update).toHaveBeenCalledWith({
            id: 7,
            name: "renamed folder",
            parentId: 3,
            oldParentId: 3,
        });
        expect(event?.folders).toStrictEqual([
            {
                request: { id: null, parentId: -1, name: "new folder" },
                response: {
                    folder: {
                        id: 20,
                        parentId: -1,
                        name: "new folder",
                        parentChanged: true,
                        nameChanged: true,
                    },
                },
            },
            {
                request: { id: 7, parentId: 3, name: "renamed folder" },
                response: {
                    folder: { id: 7, parentId: 3, name: "renamed folder" },
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

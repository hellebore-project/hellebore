import { SyncType } from "@/constants";
import type {
    PollEvent,
    PollResult,
    SyncEntryEvent,
    SyncEntryRequest,
    SyncFolderEvent,
    SyncFolderRequest,
    SyncEvent,
    SyncProjectEvent,
    SyncProjectRequest,
    SyncRequest,
    FolderUpdateResponse,
} from "@/interface";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

import { DomainManager } from "../domain";

export class SynchronizationService {
    /** Minimum amount of time to wait between full syncs in milliseconds */
    readonly DEFAULT_SYNC_PERIOD = 5000;

    private _waitingForSync = false;
    private _syncing = false;
    private _lastFullRequestTime = 0;
    private _lastFullSyncTime = 0;

    private _domain: DomainManager;

    onPoll: EventProducer<PollEvent, PollResult>;
    onSync: MultiEventProducer<SyncEvent, void>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.onPoll = new EventProducer();
        this.onSync = new MultiEventProducer();
    }

    get syncPeriod() {
        // TODO: make this configurable
        return this.DEFAULT_SYNC_PERIOD;
    }

    canSkipSync(poll: PollEvent) {
        if (poll.type === SyncType.FULL) return false;

        if (poll.project && poll.project.syncName) return false;

        for (const folderPoll of poll.folders ?? []) {
            if (folderPoll.syncTitle) return false;
        }

        for (const entryPoll of poll.entries ?? []) {
            if (
                entryPoll.syncTitle ||
                entryPoll.syncFolderId ||
                entryPoll.syncProperties ||
                entryPoll.syncText ||
                entryPoll.syncLexicon
            )
                return false;
        }

        return true;
    }

    requestPeriodicSynchronization() {
        this._lastFullRequestTime = Date.now();

        if (this._waitingForSync) return;
        this._waitingForSync = true;

        this._requestPeriodicSynchronization().finally(
            () => (this._waitingForSync = false),
        );
    }

    private async _requestPeriodicSynchronization(): Promise<SyncEvent | null> {
        while (true) {
            await new Promise((r) => setTimeout(r, this.syncPeriod));
            if (this._lastFullSyncTime > this._lastFullRequestTime) return null;
            if (Date.now() - this._lastFullRequestTime < this.syncPeriod)
                continue;
            if (this._syncing) continue;
            break;
        }

        // when requesting a periodic synchronization, all data has to be retrieved
        // since there's no guarantee that the request will get picked up due to the debouncer
        return this.requestFullSynchronization();
    }

    async requestFullSynchronization(): Promise<SyncEvent | null> {
        return this.requestSynchronization({ type: SyncType.FULL });
    }

    /**
     * Immediately fetches modified view data and creates a request to push it to the backend.
     * This method must be synchronous to guarantee that the view data has been fetched by
     * the time the method terminates.
     * @returns promise that returns the sync event or null if the request is skipped
     */
    requestSynchronization(poll: PollEvent): Promise<SyncEvent | null> {
        if (this.canSkipSync(poll)) return new Promise(() => null);

        const result = this.onPoll.produce(poll);

        if (
            !result.project &&
            (!result.entries || result.entries.length == 0) &&
            (!result.folders || result.folders.length == 0)
        )
            return new Promise(() => null);

        if (poll.type === SyncType.FULL)
            // the last sync time corresponds to the moment that the view data is retrieved
            this._lastFullSyncTime = Date.now();

        // the syncing flag is set to true as soon as the request is prepared;
        // this forces the delayed sync event to be delayed until the current sync event is handled
        this._syncing = true;
        // the waiting-for-sync flag is set to false to permit the creation of a delayed sync event
        this._waitingForSync = false;

        const projectRequest: SyncProjectRequest = {
            name: result.project?.name ?? null,
        };

        const folderRequests: SyncFolderRequest[] =
            result.folders?.map((folder) => ({
                id: folder.id,
                parentId: folder.parentId,
                name: folder.name,
            })) ?? [];

        const entryRequests: SyncEntryRequest[] =
            result.entries?.map((entry) => ({
                id: entry.id,
                entryType: entry.entryType,
                folderId: entry.folderId ?? null,
                title: entry.title ?? null,
                properties: entry.properties ?? null,
                text: entry.text ?? null,
                words: entry.words ?? null,
            })) ?? [];

        return this._synchronize({
            project: projectRequest,
            folders: folderRequests,
            entries: entryRequests,
        }).then((event) => {
            this._syncing = false;
            this.onSync.produce(event);
            return event;
        });
    }

    private async _synchronize({
        project: projectRequest = null,
        folders: folderRequests = null,
        entries: entryRequests = null,
    }: SyncRequest): Promise<SyncEvent> {
        const syncEvent: SyncEvent = {
            project: null,
            folders: [],
            entries: [],
        };

        if (projectRequest) {
            const projectEvent: SyncProjectEvent = {
                request: projectRequest,
                response: { project: null },
            };

            const projectResponse =
                await this._domain.session.updateProject(projectRequest);
            if (projectResponse)
                projectEvent.response.project = projectResponse;

            syncEvent.project = projectEvent;
        }

        if (folderRequests) {
            const folderEvents: SyncFolderEvent[] = folderRequests.map((r) => ({
                request: r,
                response: { folder: null },
            }));

            for (let i = 0; i < folderRequests.length; i++) {
                const request = folderRequests[i];
                let folderResponse: FolderUpdateResponse | null = null;

                if (request.id === null) {
                    const folderCreateResponse =
                        await this._domain.folders.create(
                            request.name,
                            request.parentId,
                        );
                    if (folderCreateResponse)
                        folderResponse = {
                            ...folderCreateResponse,
                            parentChanged: true,
                            nameChanged: true,
                        };
                } else
                    folderResponse = await this._domain.folders.update({
                        id: request.id,
                        name: request.name,
                        parentId: request.parentId,
                        oldParentId: request.parentId,
                    });

                folderEvents[i].response.folder = folderResponse;
            }

            syncEvent.folders = folderEvents;
        }

        if (entryRequests) {
            const entryEvents: SyncEntryEvent[] = entryRequests.map((r) => ({
                request: r,
                response: { entry: null },
            }));

            const entryResponses =
                await this._domain.entries.bulkUpdate(entryRequests);
            if (entryResponses) {
                for (let i = 0; i < entryEvents.length; i++)
                    entryEvents[i].response.entry = entryResponses[i];
            }

            syncEvent.entries = entryEvents;
        }

        return syncEvent;
    }
}

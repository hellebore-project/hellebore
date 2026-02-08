import {
    PollEvent,
    PollResult,
    SyncEntryEvent,
    SyncEntryRequest,
    SyncEvent,
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

    requestPeriodicSynchronization() {
        this._lastFullRequestTime = Date.now();

        if (this._waitingForSync) return;
        this._waitingForSync = true;

        this._requestPeriodicSynchronization().finally(
            () => (this._waitingForSync = false),
        );
    }

    private async _requestPeriodicSynchronization(): Promise<SyncEvent | null> {
        // we don't want too many IPC calls being sent to the backend,
        // so we space them out via a debouncer
        while (true) {
            await new Promise((r) => setTimeout(r, this.syncPeriod));
            if (this._lastFullSyncTime > this._lastFullRequestTime) return null;
            if (Date.now() - this._lastFullRequestTime < this.syncPeriod)
                continue;
            if (this._syncing) continue;
            break;
        }

        // when requesting a delayed synchronization, all data has to be retrieved
        // since there's no guarantee that the request will get picked up due to the debouncer
        return this.requestFullSynchronization();
    }

    async requestFullSynchronization(): Promise<SyncEvent | null> {
        return this.requestSynchronization({
            syncTitle: true,
            syncText: true,
            syncProperties: true,
            syncLexicon: true,
        });
    }

    /**
     * Immediately fetches modified view data and creates a request to push it to the backend.
     * This method must be synchronous to guarantee that the view data has been fetched by
     * the time the method terminates.
     * @returns promise that returns the sync event or null if the request is skipped
     */
    requestSynchronization({
        id = null,
        syncTitle = false,
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: PollEvent): Promise<SyncEvent | null> {
        if (!syncTitle && !syncProperties && !syncText && !syncLexicon)
            return new Promise(() => null);

        const result = this.onPoll.produce({
            id,
            syncTitle,
            syncProperties,
            syncText,
            syncLexicon,
        });

        if (result.entries.length == 0) return new Promise(() => null);

        if (
            id === null &&
            syncTitle &&
            syncProperties &&
            syncText &&
            syncLexicon
        )
            // the last sync time corresponds to the moment that the view data is retrieved
            this._lastFullSyncTime = Date.now();

        // the syncing flag is set to true as soon as the request is prepared;
        // this forces the delayed sync event to be delayed until the current sync event is handled
        this._syncing = true;
        // the waiting-for-sync flag is set to false to permit the creation of a delayed sync event
        this._waitingForSync = false;

        const requests: SyncEntryRequest[] = result.entries.map((result) => ({
            id: result.id,
            entryType: result.entryType,
            title: result.title ?? null,
            properties: result.properties ?? null,
            text: result.text ?? null,
            words: result.words ?? null,
        }));

        return this._synchronize(requests).then((events) => {
            this._syncing = false;
            const event = { entries: events };
            this.onSync.produce(event);
            return event;
        });
    }

    private async _synchronize(
        requests: SyncEntryRequest[],
    ): Promise<SyncEntryEvent[]> {
        const events: SyncEntryEvent[] = requests.map((r) => ({
            request: r,
            response: { entry: null },
        }));

        const entryResponses = await this._domain.entries.bulkUpdate(requests);
        if (entryResponses) {
            for (let i = 0; i < events.length; i++)
                events[i].response.entry = entryResponses[i];
        }

        return events;
    }
}

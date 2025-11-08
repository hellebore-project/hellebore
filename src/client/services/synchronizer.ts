import {
    EntryTextUpdateResponse,
    EntryTitleUpdateResponse,
    EntryUpdateResponse,
    WordUpsertResponse,
    DomainManager,
} from "@/domain";
import { EventProducer } from "@/utils/event";

import {
    PollEvent,
    PollResult,
    PollResultEntryData,
    SyncEntryEvent,
    SyncEntryRequest,
    SyncEntryResponse,
} from "../interface";

export type SyncArguments = PollEvent;

export class Synchronizer {
    readonly DEFAULT_SYNC_DELAY_TIME = 5000;

    private _waitingForSync = false;
    private _syncing = false;
    private _lastRequested = 0;
    private _lastSynced = 0;

    private _domain: DomainManager;

    onPoll: EventProducer<PollEvent, PollResult>;
    onSyncEntry: EventProducer<SyncEntryEvent, void>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.onPoll = new EventProducer();
        this.onSyncEntry = new EventProducer();
    }

    get syncDelayTime() {
        return this.DEFAULT_SYNC_DELAY_TIME;
    }

    requestDelayedSynchronization() {
        this._lastRequested = Date.now();

        if (this._waitingForSync) return;
        this._waitingForSync = true;

        this._requestDelayedSynchronization().finally(
            () => (this._waitingForSync = false),
        );
    }

    private async _requestDelayedSynchronization() {
        // we don't want too many IPC calls being the backend,
        // so we space them out via a debouncer
        while (true) {
            await new Promise((r) => setTimeout(r, this.syncDelayTime));
            if (this._lastSynced > this._lastRequested) return false;
            if (Date.now() - this._lastRequested < this.syncDelayTime) continue;
            if (this._syncing) continue;
            break;
        }

        // when requesting a delayed synchronization, all data has to be retrieved
        // since there's no guarantee that the request will get picked up due to the debouncer
        this.requestFullSynchronization();

        return true;
    }

    requestFullSynchronization(): Promise<boolean>[] {
        return this.requestSynchronization({
            syncTitle: true,
            syncText: true,
            syncProperties: true,
            syncLexicon: true,
        });
    }

    requestSynchronization({
        syncTitle = false,
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: SyncArguments): Promise<boolean>[] {
        // this method has to run synchronously;
        // we need to guarantee that the sync request is submitted before the method exits

        if (!syncTitle && !syncProperties && !syncText && !syncLexicon)
            return [];

        const [result] = this.onPoll.produce({
            syncTitle,
            syncProperties,
            syncText,
            syncLexicon,
        });

        if (result.entries.length == 0) return [];

        // the last synced time corresponds to the moment that the view data is retrieved
        this._lastSynced = Date.now();
        // the syncing flag is set to true as soon as the request is prepared;
        // this forces the delayed sync event to be delayed until the current sync event is handled
        this._syncing = true;
        // the waiting-for-sync flag is set to false to permit the creation of a delayed sync event
        this._waitingForSync = false;

        const syncPromises: Promise<boolean>[] = [];

        for (const entryResult of result.entries)
            syncPromises.push(this._requestEntrySynchronization(entryResult));

        return syncPromises;
    }

    private _requestEntrySynchronization(result: PollResultEntryData) {
        const request: SyncEntryRequest = {
            id: result.id,
            entityType: result.entityType,
            title: result.title ?? null,
            properties: result.properties ?? null,
            text: result.text ?? null,
            words: result.words ?? null,
        };

        return this._synchronizeEntry(request).then((response) => {
            this._syncing = false;
            if (!response) return false;
            this.onSyncEntry.produce({ request, response });
            return true;
        });
    }

    private async _synchronizeEntry({
        id,
        entityType,
        title,
        properties,
        text,
        words,
    }: SyncEntryRequest): Promise<SyncEntryResponse> {
        // TODO: rework this so that the data gets sent in a single IPC call.
        // syncing the entry via multiple IPC calls is really bad

        let titleUpdateResponse: EntryTitleUpdateResponse | null = null;
        if (typeof title === "string")
            titleUpdateResponse = await this._domain.entries.updateTitle(
                id,
                title,
            );

        let textUpdateResponse: EntryTextUpdateResponse | null = null;
        if (typeof text === "string")
            textUpdateResponse = await this._domain.entries.updateText(
                id,
                text,
            );

        let propertiesResponse: EntryUpdateResponse | null = null;
        if (properties)
            propertiesResponse = await this._domain.entries.updateProperties(
                id,
                entityType,
                properties,
            );

        let lexiconResponse: WordUpsertResponse[] | null = null;
        if (words) {
            try {
                lexiconResponse = await this._domain.words.bulkUpsert(words);
            } catch (error) {
                console.error("Failed to update lexicon.");
                console.error(error);
            }
            if (lexiconResponse === null)
                console.error("Failed to update lexicon.");
        }

        return {
            title: titleUpdateResponse,
            text: textUpdateResponse,
            properties: propertiesResponse,
            lexicon: lexiconResponse,
        };
    }
}

import { ComboboxItem } from "@mantine/core";
import { makeAutoObservable } from "mobx";

import { OpenEntryEditorEvent } from "@/client/interface";
import { DomainManager } from "@/domain";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

type PrivateKeys = "_waitingForQuery" | "_lastQueryRequestTime" | "_domain";

export class EntrySearchService {
    // CONSTANTS
    readonly DEFAULT_HEIGHT = 50;
    readonly DEFAULT_QUERY_PERIOD = 500;

    // CONFIG
    /** Minimum amount of time to wait between queries to the backend in milliseconds */
    queryPeriod: number;

    // STATE
    private _searchQuery = "";
    private _searchData: ComboboxItem[];
    private _waitingForQuery = false;
    private _lastQueryRequestTime = 0;

    // SERVICES
    private _domain: DomainManager;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onOpenEntry: MultiEventProducer<OpenEntryEditorEvent, unknown>;

    constructor(domain: DomainManager) {
        this.queryPeriod = this.DEFAULT_QUERY_PERIOD;

        this._searchData = [];

        this._domain = domain;

        this.fetchPortalSelector = new EventProducer();
        this.onOpenEntry = new MultiEventProducer();

        makeAutoObservable<EntrySearchService, PrivateKeys>(this, {
            queryPeriod: false,
            _waitingForQuery: false,
            _lastQueryRequestTime: false,
            _domain: false,
            fetchPortalSelector: false,
            onOpenEntry: false,
        });
    }

    get enabled() {
        return this._domain.hasProject;
    }

    get searchQuery() {
        return this._searchQuery;
    }

    set searchQuery(value: string) {
        this._searchQuery = value;
        this._requestEntryQuery();
    }

    get searchData() {
        return this._searchData;
    }

    set searchData(value: ComboboxItem[]) {
        this._searchData = value;
    }

    selectEntrySearchResult(value: string | null) {
        if (value === null || value === "") return;
        this.onOpenEntry.produce({ id: Number(value), focus: true });
        this.cleanUp();
    }

    private async _requestEntryQuery() {
        this._lastQueryRequestTime = Date.now();

        if (this._waitingForQuery) return;
        this._waitingForQuery = true;

        while (true) {
            await new Promise((r) => setTimeout(r, this.queryPeriod));
            if (Date.now() - this._lastQueryRequestTime < this.queryPeriod)
                continue;
            break;
        }

        return this._queryEntries(this._searchQuery)
            .then((data) => (this.searchData = data))
            .finally(() => (this._waitingForQuery = false));
    }

    private async _queryEntries(keyword: string): Promise<ComboboxItem[]> {
        if (keyword === "") return [];

        const entries = await this._domain.entries.search({
            keyword: this._searchQuery,
            limit: 10,
        });
        if (entries)
            return entries.map((entry) => ({
                label: entry.title,
                value: entry.id.toString(),
            }));

        return [];
    }

    cleanUp() {
        this._searchQuery = "";
        this._searchData = [];
    }
}

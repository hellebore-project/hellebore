import type {
    IComponentService,
    OpenEntryEditorEvent,
    OptionData,
} from "@/interface";
import { DomainManager } from "@/services";
import { MultiEventProducer } from "@/utils/event-producer";

export class EntrySearchService implements IComponentService {
    readonly key = "entry-search";
    readonly DEFAULT_QUERY_PERIOD = 500;

    // CONFIG
    queryPeriod: number = this.DEFAULT_QUERY_PERIOD;

    // STATE
    private _queryString: string = $state("");
    private _queryResults: OptionData<number>[] = $state([]);
    private _waitingForQuery = false;
    private _lastQueryRequestTime = 0;

    // SERVICES
    private _domain: DomainManager;

    // EVENTS
    onOpenEntry: MultiEventProducer<OpenEntryEditorEvent, unknown>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.onOpenEntry = new MultiEventProducer();
    }

    get queryString() {
        return this._queryString;
    }

    set queryString(value: string) {
        this._queryString = value;
        this._requestEntryQuery();
    }

    get queryResults() {
        return this._queryResults;
    }

    set queryResults(value: OptionData<number>[]) {
        this._queryResults = value;
    }

    selectEntry(entryId?: string | null) {
        if (entryId === null || entryId === undefined) return;
        console.log(this.onOpenEntry.broker);
        this.onOpenEntry.produce({ id: Number(entryId), focus: true });
        this.cleanUp();
    }

    private async _requestEntryQuery() {
        this._lastQueryRequestTime = Date.now();

        if (this._waitingForQuery) return;

        this._waitingForQuery = true;

        while (true) {
            await new Promise((r) => setTimeout(r, this.queryPeriod));
            const now = Date.now();
            if (now - this._lastQueryRequestTime < this.queryPeriod) continue;
            break;
        }

        return this._queryEntries()
            .then((data) => (this.queryResults = data))
            .finally(() => (this._waitingForQuery = false));
    }

    private async _queryEntries(): Promise<OptionData<number>[]> {
        const keyword = this._queryString;

        if (keyword === "") return [];

        const entries = await this._domain.entries.search({
            keyword,
            limit: 10,
        });
        if (entries)
            return entries.map((entry) => ({
                label: entry.title,
                value: entry.id,
            }));

        return [];
    }

    cleanUp() {
        this._queryString = "";
        this._queryResults = [];
    }
}

export default EntrySearchService;

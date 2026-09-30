import type { IComponentService, Id, Word, WordKey } from "@/interface";
import {
    WordType,
    DomainManager,
    ENTRY_ID_SENTINEL,
    WordProperty,
    DataType,
    PredicateType,
    type FilterItemUnion,
} from "@/api";
import { ClientData } from "@/models";
import {
    type DataCellEditEvent, DataTableService, type DataTableQueryRequest,
    type DataTableQueryResult
} from "@/lib/components/data-table";
import { MultiEventProducer } from "@/utils/event-producer";

import { WordColumnKey, WORD_COLUMNS } from "./word-table-constants";
import type { WordColumnMetaData, WordRow } from "./word-table-interface";

export class WordTableService implements IComponentService {
    // STATE VARIABLES
    private _id: string;
    private _sentinelKey: WordKey = $state("");
    private _languageId: Id = $state(ENTRY_ID_SENTINEL);
    private _keyCounter = 0;
    private _defaultWordType = WordType.RootWord;
    private _data: ClientData;

    // SERVICES
    private _domain: DomainManager;
    table: DataTableService<WordColumnKey, WordColumnMetaData>;

    // EVENTS
    onChange: MultiEventProducer<void, unknown>;

    constructor(id: string, domain: DomainManager, data: ClientData) {
        this._id = id;
        this._domain = domain;
        this._data = data;

        this.table = new DataTableService({
            id: `${this._id}-data-table`,
            columns: WORD_COLUMNS,
            pageCount: 1,
        });
        this.table.onQueryData.subscribe((event) => this._fetchData(event));
        this.table.onSetValue.subscribe((event) => this._onSetValue(event));

        this.onChange = new MultiEventProducer();
    }

    // PROPERTIES

    get id() {
        return this._id;
    }

    get changed() {
        return this.table.modifiedKeys.size > 0;
    }

    get sentinelKey(): WordKey {
        return this._sentinelKey;
    }

    // LOADING

    async load(languageId: Id) {
        this._languageId = languageId;
        this._keyCounter = 0;
        const result = await this._fetchData();
        this.table.load(result?.items ?? []);
        this._addNewRow();
    }

    private async _fetchData(request?: DataTableQueryRequest<WordColumnKey>): Promise<DataTableQueryResult<WordRow> | null> {
        const filters: FilterItemUnion<WordProperty>[] = [
            {
                field: WordProperty.LanguageId,
                type: DataType.Uuid,
                predicate: {
                    type: PredicateType.Equal,
                    value: this._languageId,
                },
            },
        ];

        if (request) {
            for (const [colKey, filterItem] of Object.entries(request.filters)) {
                const col = this.table.findColumn(colKey as WordColumnKey);
                if (!col) continue;

                filters.push({
                    field: col.metaData.property,
                    type: col.dataType,
                    predicate: filterItem.predicate,
                } as FilterItemUnion<WordProperty>);
            }
        }
        
        const response = await this._domain.words.list(
            this._data.loadedProjectId,
            {
                filters,
                options: {},
            }
        );
        if (!response) return null;

        const items: WordRow[] = response.items.map((w) => ({
            key: String(w.id),
            languageId: w.languageId,
            id: w.id,
            cells: {
                wordType: { value: String(w.wordType) },
                spelling: { value: w.spelling },
                definition: { value: w.definition },
                translations: { value: w.translations.join(", ") },
            },
        }));

        return {
            items,
            pagination: {
                pageIndex: response.pageIndex,
                pageCount: response.pageCount,
                total: response.total,
            }
        };
    }

    // ROW EDITING

    private _nextKey(): WordKey {
        return `N${this._keyCounter++}`;
    }

    private _addNewRow() {
        this._sentinelKey = this._nextKey();
        const sentinelRow: WordRow = {
            key: this._sentinelKey,
            filterable: false,
            languageId: this._languageId,
            id: null,
            cells: {
                wordType: { value: "" },
                spelling: { value: "" },
                definition: { value: "" },
                translations: { value: "" },
            },
        };
        this.table.addRow(sentinelRow);
    }

    async removeRow(key: WordKey) {
        if (key === this._sentinelKey) return;

        const row = this.table.findRow(key) as WordRow | undefined;
        if (!row) return;

        // a row will only have an id if it corresponds to an existing word in the backend
        if (row.id !== null) {
            const projectId = this._data.loadedProjectId;

            const success = await this._domain.words.delete(projectId, row.id);
            if (!success) return;
        }

        this.table.removeRow(key);
    }

    // CELL EDITING

    private _onSetValue({ rowKey }: DataCellEditEvent<WordColumnKey>) {
        if (rowKey === this._sentinelKey) {
            const row = this.table.findRow(rowKey) as WordRow | undefined;

            if (row) {
                row.filterable = true;

                if (row.cells.wordType.value === "")
                    // word type is a mandatory property, so try to pick a reasonable value if the user hasn't set it
                    row.cells.wordType.value = String(this._defaultWordType);
            }

            this._addNewRow();
        }

        this.onChange.produce();
    }

    // SYNC

    claimModifiedWords(): Word[] {
        const result: Word[] = [];
        for (const key of this.table.modifiedKeys) {
            const row = this.table.findRow(key) as WordRow | undefined;
            if (!row) continue;
            result.push({
                key,
                id: row.id,
                wordType: Number(row.cells.wordType.value) as WordType,
                languageId: row.languageId,
                spelling: row.cells.spelling.value,
                definition: row.cells.definition.value,
                translations: row.cells.translations.value
                    ? row.cells.translations.value
                          .split(/[,;]/)
                          .map((s) => s.trim())
                          .filter(Boolean)
                    : [],
            });
        }
        this.table.modifiedKeys.clear();
        return result;
    }

    handleSynchronization(words: Word[]) {
        for (const word of words) {
            const row = this.table.findRow(word.key) as WordRow | undefined;
            if (row) row.id = word.id;
        }
    }

    // CLEAN UP

    cleanUp() {
        this.table.reset();
    }
}

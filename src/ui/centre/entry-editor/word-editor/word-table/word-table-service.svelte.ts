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
    DataTableService,
    type DataTableQueryRequest,
    type DataTableQueryResult,
} from "@/lib/components/data-table";
import { MultiEventProducer } from "@/utils/event-producer";

import { WordColumnKey, WORD_COLUMNS } from "./word-table-constants";
import type { WordColumnMetaData, WordRow } from "./word-table-interface";

export class WordTableService implements IComponentService {
    // STATE VARIABLES
    private _id: string;
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
        this.table.onSetValue.subscribe(() => this._onSetValue());

        this.onChange = new MultiEventProducer();
    }

    // PROPERTIES

    get id() {
        return this._id;
    }

    get changed() {
        return this.table.modifiedKeys.size > 0;
    }

    // LOADING

    async load(languageId: Id) {
        this._languageId = languageId;
        const result = await this._fetchData();
        this.table.load(result?.items ?? []);
    }

    private async _fetchData(
        request?: DataTableQueryRequest<WordColumnKey>,
    ): Promise<DataTableQueryResult<WordRow> | null> {
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
            for (const [colKey, filterItem] of Object.entries(
                request.filters,
            )) {
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
            },
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
            },
        };
    }

    // ROWS

    appendRow(): WordKey {
        const rowKey = this._nextKey();
        this.table.appendRow(this._createRow(rowKey));
        this._trackAddedRow(rowKey);
        return rowKey;
    }

    insertRowAbove(rowKey: WordKey) {
        const index = this.table.rows.findIndex((row) => row.key === rowKey);
        if (index < 0) return;
        this._insertRowAt(index);
    }

    insertRowBelow(rowKey: WordKey) {
        const index = this.table.rows.findIndex((row) => row.key === rowKey);
        if (index < 0) return;
        this._insertRowAt(index + 1);
    }

    private _insertRowAt(index: number): WordKey {
        const rowKey = this._nextKey();
        this.table.insertRow(index, this._createRow(rowKey));
        this._trackAddedRow(rowKey);
        return rowKey;
    }

    private _createRow(rowKey: WordKey): WordRow {
        return {
            key: rowKey,
            languageId: this._languageId,
            id: null,
            cells: {
                wordType: { value: String(this._defaultWordType) },
                spelling: { value: "" },
                definition: { value: "" },
                translations: { value: "" },
            },
        };
    }

    private _trackAddedRow(rowKey: WordKey) {
        this.table.modifiedKeys.add(rowKey);
        this.onChange.produce();
    }

    async removeRow(key: WordKey) {
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

    private _nextKey(): WordKey {
        let rowKey: WordKey;
        do {
            rowKey = `N${this._keyCounter++}`;
        } while (this.table.findRow(rowKey));
        return rowKey;
    }

    // CELL EDITING

    private _onSetValue() {
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

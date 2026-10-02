import type { IComponentService, Id, Word, WordKey } from "@/interface";
import {
    WordType,
    DomainManager,
    ENTRY_ID_SENTINEL,
    WordProperty,
    DataType,
    PredicateType,
    type FilterItemUnion,
    type Pagination,
} from "@/api";
import { ClientData } from "@/models";
import {
    DataTableService,
    type DataTableQueryRequest,
    type DataTableQueryResult,
} from "@/lib/components/data-table";
import { MultiEventProducer } from "@/utils/event-producer";

import { WordColumnKey, WORD_COLUMNS } from "./word-table-constants";
import type {
    WordColumnMetaData,
    WordRow,
    WordRowMetaData,
} from "./word-table-interface";
import { ChangePageAction } from "@/constants";

export class WordTableService implements IComponentService {
    // STATE VARIABLES
    private _id: string;
    private _languageId: Id = $state(ENTRY_ID_SENTINEL);
    private _keyCounter = 0;
    private _defaultWordType = WordType.RootWord;
    private _data: ClientData;

    // SERVICES
    private _domain: DomainManager;
    table: DataTableService<WordColumnKey, WordRowMetaData, WordColumnMetaData>;

    // EVENTS
    onChange: MultiEventProducer<void, unknown>;

    constructor(id: string, domain: DomainManager, data: ClientData) {
        this._id = id;
        this._domain = domain;
        this._data = data;

        this.table = new DataTableService({
            id: `${this._id}-data-table`,
            columns: WORD_COLUMNS,
            rowPerPageCount: 10,
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
        await this.table.load();
    }

    private async _fetchData(
        request?: DataTableQueryRequest<WordColumnKey>,
    ): Promise<DataTableQueryResult<WordRow> | null> {
        let oldPageIndex = 0;

        const pagination: Pagination = {
            pageIndex: 0,
            offset: 0,
            limit: 10,
        };

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
            oldPageIndex = request.pagination.oldPageIndex;

            if (request.pagination.newPageIndex !== undefined)
                pagination.pageIndex = request.pagination.newPageIndex;
            else {
                switch (request.pagination.action) {
                    case ChangePageAction.FirstPage:
                        pagination.pageIndex = 0;
                        break;

                    case ChangePageAction.LastPage:
                        if (
                            request.pagination.pageCount !== null &&
                            request.pagination.pageCount !== undefined
                        )
                            pagination.pageIndex =
                                request.pagination.pageCount - 1;
                        break;

                    case ChangePageAction.PreviousPage:
                        pagination.pageIndex = Math.max(oldPageIndex - 1, 0);
                        break;

                    case ChangePageAction.NextPage:
                        pagination.pageIndex = oldPageIndex + 1;
                        break;
                }
            }

            if (
                request.pagination.oldOffset !== null &&
                request.pagination.oldOffset !== undefined
            )
                pagination.offset =
                    request.pagination.oldOffset +
                    request.pagination.limit *
                        ((pagination.pageIndex ?? 0) - oldPageIndex);

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
                pagination,
                filters,
                options: {},
                includeTotal: true,
            },
        );

        if (!response) return null;

        const items: WordRow[] = response.items.map((word, index) => ({
            key: String(word.id),
            cells: {
                wordType: { value: String(word.wordType) },
                spelling: { value: word.spelling },
                definition: { value: word.definition },
                translations: { value: word.translations.join(", ") },
            },
            metaData: {
                id: word.id,
                languageId: word.languageId,
                index:
                    response.offset !== null ? response.offset + index : null,
            },
        }));

        return {
            items,
            pagination: {
                pageIndex: response.pageIndex,
                pageCount: response.pageCount,
                total: response.total,
                offset: response.offset,
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
            cells: {
                wordType: { value: String(this._defaultWordType) },
                spelling: { value: "" },
                definition: { value: "" },
                translations: { value: "" },
            },
            metaData: {
                id: null,
                languageId: this._languageId,
                // NOTE: we deliberately omit the index here because
                // we have no way of knowing the row's true position
                // in the server-side result set
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
        if (row.metaData.id !== null) {
            const projectId = this._data.loadedProjectId;

            const success = await this._domain.words.delete(
                projectId,
                row.metaData.id,
            );
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
                id: row.metaData.id,
                wordType: Number(row.cells.wordType.value) as WordType,
                languageId: row.metaData.languageId,
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
            if (row) row.metaData.id = word.id;
        }
    }

    // CLEAN UP

    cleanUp() {
        this.table.reset();
    }
}

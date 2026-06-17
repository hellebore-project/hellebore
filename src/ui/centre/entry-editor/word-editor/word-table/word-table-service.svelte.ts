import type { IComponentService, Id, Word, WordKey } from "@/interface";
import {
    WordType,
    DomainManager,
    type WordQuery,
    ENTRY_ID_SENTINEL,
} from "@/api";
import { DataTableService } from "@/lib/components/data-table";
import type { ColumnDef } from "@/lib/components/data-table";
import { ClientData } from "@/models";
import { ReplaceDebouncer, type DebouncerResult } from "@/utils/debouncer";
import { MultiEventProducer } from "@/utils/event-producer";

import { WordColumnKey, WORD_TYPE_SELECT_ITEMS } from "./word-table-constants";
import type { WordRow } from "./word-table-interface";

const WORD_COLUMNS: ColumnDef<WordColumnKey>[] = [
    {
        key: WordColumnKey.WordType,
        label: "Type",
        type: "select",
        filterable: true,
        items: WORD_TYPE_SELECT_ITEMS,
    },
    {
        key: WordColumnKey.Spelling,
        label: "Spelling",
        type: "text",
        filterable: true,
    },
    {
        key: WordColumnKey.Definition,
        label: "Definition",
        type: "text",
        filterable: true,
    },
    {
        key: WordColumnKey.Translations,
        label: "Translations",
        type: "text",
        filterable: true,
    },
];

export class WordTableService implements IComponentService {
    private static readonly DEFAULT_WORDS_PER_PAGE_COUNT = 50;
    private static readonly FILTER_WAIT_TIME = 300;

    // CONFIGURATION
    words_per_page_count = WordTableService.DEFAULT_WORDS_PER_PAGE_COUNT;

    // STATE VARIABLES
    private _id: string;
    private _sentinelKey: WordKey = $state("");
    private _languageId: Id = $state(ENTRY_ID_SENTINEL);
    private _keyCounter = 0;
    private _textFilterDebouncer: ReplaceDebouncer<void, void>;
    private _data: ClientData;

    // SERVICES
    private _domain: DomainManager;
    table: DataTableService<WordColumnKey>;

    // EVENTS
    onChange: MultiEventProducer<void, unknown>;

    constructor(id: string, domain: DomainManager, data: ClientData) {
        this._id = id;
        this._domain = domain;
        this._data = data;
        this.table = new DataTableService({
            id: `${this._id}-data-table`,
            columns: WORD_COLUMNS,
            onFilter: (colKey, values) => void this._onFilter(colKey, values),
            onSetValue: (rowKey) => this._onSetValue(rowKey),
            onPageChange: (page) => void this._onPageChange(page),
        });
        this.onChange = new MultiEventProducer();
        this._textFilterDebouncer = new ReplaceDebouncer(
            this._delayedReload.bind(this),
            WordTableService.FILTER_WAIT_TIME,
        );
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
        this.table.pageIndex = 0;
        await this._reload();
    }

    private async _reload() {
        if (this._languageId === ENTRY_ID_SENTINEL) return;

        const projectId = this._data.loadedProjectId;
        const query = this._buildQuery();
        console.log(query);
        const response = await this._domain.words.getAllForLanguage(
            projectId,
            query,
        );
        if (!response) return;

        console.log(response);
        this.table.pageIndex = response.pageIndex;
        this.table.pageCount = Math.max(response.totalPageCount, 1);

        const rows: WordRow[] = response.data.map((w) => ({
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
        this.table.load(rows);

        this._addSentinel();
    }

    private async _delayedReload(): Promise<DebouncerResult<void>> {
        await this._reload();
        return { status: "resolved", value: undefined };
    }

    private _buildQuery(): WordQuery {
        const wordTypes = this.table.getColumnFilter(WordColumnKey.WordType);
        const spelling = this.table.getTextColumnFilter(WordColumnKey.Spelling);
        const definition = this.table.getTextColumnFilter(
            WordColumnKey.Definition,
        );
        const translations = this.table.getTextColumnFilter(
            WordColumnKey.Translations,
        );

        return {
            languageId: this._languageId,
            pageIndex: this.table.pageIndex,
            itemsPerPageCount: this.words_per_page_count,
            wordTypes:
                wordTypes.length > 0
                    ? wordTypes.map((value) => Number(value) as WordType)
                    : null,
            spelling: spelling || null,
            definition: definition || null,
            translations: translations || null,
        };
    }

    // ADDITION

    private _nextKey(): WordKey {
        return `N${this._keyCounter++}`;
    }

    private _addSentinel() {
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

    // REMOVAL

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

    // EDITING

    private _onSetValue(rowKey: string) {
        if (rowKey === this._sentinelKey) {
            const row = this.table.findRow(rowKey) as WordRow | undefined;

            if (row) {
                row.filterable = true;

                if (row.cells.wordType.value === "") {
                    const filterValues = this.table.getColumnFilter(
                        WordColumnKey.WordType,
                    );
                    row.cells.wordType.value =
                        filterValues[0] ?? String(WordType.RootWord);
                }
            }

            this._addSentinel();
        }

        this.onChange.produce();
    }

    // FILTERING

    private async _onFilter(colKey: WordColumnKey, values: string[]) {
        if (colKey === WordColumnKey.WordType && values.length > 0) {
            const sentinel = this.table.findRow(this._sentinelKey) as
                | WordRow
                | undefined;
            if (
                sentinel &&
                sentinel.cells.wordType.value !== "" &&
                !values.includes(sentinel.cells.wordType.value)
            ) {
                sentinel.cells.wordType.value = values[0];
            }
        }

        this.table.pageIndex = 0;

        if (colKey === WordColumnKey.WordType) {
            await this._reload();
            return;
        }

        void this._textFilterDebouncer.call(undefined).catch(() => undefined);
    }

    // PAGINATION

    private async _onPageChange(page: number) {
        this.table.pageIndex = page;
        await this._reload();
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
        this._textFilterDebouncer.cancel();
        this.table.reset();
    }
}

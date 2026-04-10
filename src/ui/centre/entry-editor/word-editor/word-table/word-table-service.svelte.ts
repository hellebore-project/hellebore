import { WordType } from "@/constants";
import type {
    IComponentService,
    Word,
    WordKey,
    WordResponse,
} from "@/interface";
import { DomainManager } from "@/services";
import { DataTableService } from "@/lib/components/data-table";
import type { ColumnDef } from "@/lib/components/data-table";

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
    private _id: string;
    private _sentinelKey: WordKey = $state("");
    private _languageId = -1;
    private _keyCounter = 0;
    private _domain: DomainManager;

    table: DataTableService<WordColumnKey>;

    constructor(id: string, domain: DomainManager) {
        this._id = id;
        this._domain = domain;
        this.table = new DataTableService({
            id: `${this._id}-data-table`,
            columns: WORD_COLUMNS,
            onFilter: (colKey, values) => this._onFilter(colKey, values),
            onSetValue: (rowKey) => this._onSetValue(rowKey),
        });
    }

    // PROPERTIES

    get id() {
        return this._id;
    }

    get sentinelKey(): WordKey {
        return this._sentinelKey;
    }

    // LOADING

    load(words: WordResponse[], languageId: number) {
        this._languageId = languageId;
        this._keyCounter = 0;
        const rows: WordRow[] = words.map((w) => ({
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

    // DATA

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

    async removeRow(key: WordKey) {
        if (key === this._sentinelKey) return;

        const row = this.table.findRow(key) as WordRow | undefined;
        if (!row) return;

        // a row will only have an id if it corresponds to an existing word in the backend
        if (row.id !== null) {
            const success = await this._domain.words.delete(row.id);
            if (!success) return;
        }

        this.table.removeRow(key);
    }

    private _onSetValue(rowKey: string) {
        if (rowKey !== this._sentinelKey) return;
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

    private _onFilter(colKey: WordColumnKey, values: string[]) {
        if (colKey !== WordColumnKey.WordType) return;
        if (values.length === 0) return;

        const sentinel = this.table.findRow(this._sentinelKey) as
            | WordRow
            | undefined;
        if (!sentinel) return;

        if (
            sentinel.cells.wordType.value !== "" &&
            !values.includes(sentinel.cells.wordType.value)
        )
            sentinel.cells.wordType.value = values[0];
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

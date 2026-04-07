import { WordType } from "@/constants";
import type { Word, WordKey, WordResponse } from "@/interface";
import { DomainManager } from "@/services";
import { TableService } from "@/lib/components/data-table";

import { WordColumnKey, WORD_TYPE_SELECT_ITEMS } from "./word-table-constants";
import type { WordRow } from "./word-table-interface";

export class WordTableService {
    private _sentinelKey: WordKey = $state("");
    private _languageId = -1;
    private _keyCounter = 0;
    private _filterTypes: WordType[] = $state([]);
    private _domain: DomainManager;

    table: TableService<WordColumnKey>;

    constructor(domain: DomainManager) {
        this._domain = domain;
        this.table = new TableService({
            columns: [
                {
                    key: WordColumnKey.WordType,
                    label: "Type",
                    type: "select",
                    items: WORD_TYPE_SELECT_ITEMS,
                },
                {
                    key: WordColumnKey.Spelling,
                    label: "Spelling",
                    type: "text",
                },
                {
                    key: WordColumnKey.Definition,
                    label: "Definition",
                    type: "text",
                },
                {
                    key: WordColumnKey.Translations,
                    label: "Translations",
                    type: "text",
                },
            ],
            filterRow: (row) => {
                if (this._filterTypes.length === 0) return false;
                const wordRow = row as WordRow;
                return (
                    wordRow.key === this._sentinelKey ||
                    this._filterTypes.includes(
                        Number(wordRow.cells.wordType.value) as WordType,
                    )
                );
            },
            onSetValue: (rowKey) => {
                if (rowKey === this._sentinelKey) {
                    const row = this.table.findRow(rowKey) as
                        | WordRow
                        | undefined;
                    if (row && row.cells.wordType.value === "") {
                        row.cells.wordType.value = String(
                            this._filterTypes[0] ?? WordType.None,
                        );
                    }
                    this._addSentinel();
                }
            },
        });
    }

    // PROPERTIES

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

    setFilter(types: WordType[]) {
        this._filterTypes = types.toSorted();

        const sentinel = this.table.findRow(this._sentinelKey) as
            | WordRow
            | undefined;
        if (!sentinel) return;

        if (
            sentinel.cells.wordType.value !== "" &&
            !this._filterTypes.includes(
                Number(sentinel.cells.wordType.value) as WordType,
            )
        ) {
            const newType = this._filterTypes[0] ?? WordType.None;
            sentinel.cells.wordType.value = String(newType);
        }
    }

    private _addSentinel() {
        this._sentinelKey = this._nextKey();
        const sentinelRow: WordRow = {
            key: this._sentinelKey,
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

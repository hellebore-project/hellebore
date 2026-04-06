import { SvelteSet } from "svelte/reactivity";

import { WordType } from "@/constants";
import type { Word, WordKey, WordResponse } from "@/interface";
import { DomainManager } from "@/services";

import { WORD_COLUMNS, type WordColumnKey } from "./word-table-constants";
import type {
    PositionKey,
    SelectionAnchor,
    WordRow,
} from "./word-table-interface";

export class WordTableService {
    private _rows: WordRow[] = $state([]);
    private _sentinelKey: WordKey = $state("");
    private _modifiedKeys = new SvelteSet<WordKey>();
    private _languageId = -1;
    private _keyCounter = 0;
    private _filterTypes: WordType[] = $state([]);
    private _selectionAnchor: SelectionAnchor | null = null;
    private _isDragging = false;
    private _domain: DomainManager;

    selectedCells = new SvelteSet<PositionKey>();
    editCell: { rowKey: WordKey; colKey: WordColumnKey } | null = $state(null);

    constructor(domain: DomainManager) {
        this._domain = domain;
    }

    // DERIVED

    get visibleRows(): WordRow[] {
        if (this._filterTypes.length === 0) return [];
        const filtered = this._rows.filter(
            (r) =>
                r.key === this._sentinelKey ||
                this._filterTypes.includes(r.wordType),
        );
        return filtered;
    }

    get activeCell(): { rowKey: WordKey; colKey: WordColumnKey } | null {
        if (!this._selectionAnchor) return null;
        const visible = this.visibleRows;
        const idx = this._selectionAnchor.rowIndex;
        if (idx < 0 || idx >= visible.length) return null;
        return {
            rowKey: visible[idx].key,
            colKey: this._selectionAnchor.colKey,
        };
    }

    get sentinelKey(): WordKey {
        return this._sentinelKey;
    }

    private get _defaultNewWordType(): WordType {
        return this._filterTypes[0] ?? WordType.None;
    }

    // FILTER

    setFilter(types: WordType[]) {
        this._filterTypes = [...types];
    }

    // SELECTION

    selectSingle(rowKey: WordKey, colKey: WordColumnKey) {
        this.selectedCells.clear();
        this.selectedCells.add(`${rowKey}-${colKey}`);
        const rowIdx = this.visibleRows.findIndex((r) => r.key === rowKey);
        this._selectionAnchor =
            rowIdx >= 0 ? { rowIndex: rowIdx, colKey } : null;
    }

    selectRange(rowKey: WordKey, colKey: WordColumnKey) {
        if (!this._selectionAnchor) {
            this.selectSingle(rowKey, colKey);
            return;
        }
        const visible = this.visibleRows;
        const targetRowIdx = visible.findIndex((r) => r.key === rowKey);
        if (targetRowIdx < 0) return;

        const minRow = Math.min(this._selectionAnchor.rowIndex, targetRowIdx);
        const maxRow = Math.max(this._selectionAnchor.rowIndex, targetRowIdx);
        const anchorColIdx = WORD_COLUMNS.indexOf(this._selectionAnchor.colKey);
        const targetColIdx = WORD_COLUMNS.indexOf(colKey);
        const minCol = Math.min(anchorColIdx, targetColIdx);
        const maxCol = Math.max(anchorColIdx, targetColIdx);

        const newSelected = new SvelteSet<PositionKey>();
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                newSelected.add(`${visible[r].key}-${WORD_COLUMNS[c]}`);
            }
        }
        this.selectedCells = newSelected;
    }

    toggleCell(rowKey: WordKey, colKey: WordColumnKey) {
        const posKey = `${rowKey}-${colKey}`;
        if (this.selectedCells.has(posKey)) {
            this.selectedCells.delete(posKey);
        } else {
            this.selectedCells.add(posKey);
        }
        const rowIdx = this.visibleRows.findIndex((r) => r.key === rowKey);
        this._selectionAnchor =
            rowIdx >= 0 ? { rowIndex: rowIdx, colKey } : null;
    }

    startDrag(rowKey: WordKey, colKey: WordColumnKey) {
        this._isDragging = true;
        this.selectSingle(rowKey, colKey);
    }

    dragTo(rowKey: WordKey, colKey: WordColumnKey) {
        if (!this._isDragging) return;
        this.selectRange(rowKey, colKey);
    }

    endDrag() {
        this._isDragging = false;
    }

    // EDITING

    startEdit(rowKey: WordKey, colKey: WordColumnKey) {
        const row = this._rows.find((r) => r.key === rowKey);
        if (!row) return;
        row.cells[colKey].oldValue = row.cells[colKey].value;
        this.editCell = { rowKey, colKey };
        this.selectSingle(rowKey, colKey);
    }

    commitEdit() {
        if (!this.editCell) return;
        const { rowKey, colKey } = this.editCell;
        const row = this._rows.find((r) => r.key === rowKey);
        if (row) row.cells[colKey].oldValue = undefined;
        this.editCell = null;
    }

    cancelEdit() {
        if (!this.editCell) return;
        const { rowKey, colKey } = this.editCell;
        const row = this._rows.find((r) => r.key === rowKey);
        if (row && row.cells[colKey].oldValue !== undefined) {
            row.cells[colKey].value = row.cells[colKey].oldValue!;
            row.cells[colKey].oldValue = undefined;
        }
        this.editCell = null;
    }

    setValue(rowKey: WordKey, colKey: WordColumnKey, value: string) {
        const row = this._rows.find((r) => r.key === rowKey);
        if (!row) return;
        row.cells[colKey].value = value;

        if (rowKey === this._sentinelKey) {
            const oldKey = this._sentinelKey;
            const newKey = this._nextKey();
            row.key = newKey;
            row.wordType = this._defaultNewWordType;
            row.languageId = this._languageId;
            this._modifiedKeys.add(newKey);

            if (this.editCell?.rowKey === oldKey) {
                this.editCell = {
                    rowKey: newKey,
                    colKey: this.editCell.colKey,
                };
            }

            const prefix = `${oldKey}-`;
            const entries = [...this.selectedCells];
            this.selectedCells.clear();
            for (const posKey of entries) {
                this.selectedCells.add(
                    posKey.startsWith(prefix)
                        ? `${newKey}-${posKey.slice(prefix.length)}`
                        : posKey,
                );
            }

            this._addSentinel();
        } else {
            this._modifiedKeys.add(rowKey);
        }
    }

    // KEYBOARD

    handleTableKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) return;
        const active = this.activeCell;
        if (!active) return;
        this.handleKeyDown(e, active.rowKey, active.colKey);
    }

    handleCellMouseDown(e: MouseEvent, rowKey: WordKey, colKey: WordColumnKey) {
        const posKey = `${rowKey}-${colKey}`;
        if (e.shiftKey) {
            e.preventDefault();
            this.selectRange(rowKey, colKey);
        } else if (e.ctrlKey || e.metaKey) {
            this.toggleCell(rowKey, colKey);
        } else if (this.selectedCells.has(posKey) && !this.editCell) {
            this.startEdit(rowKey, colKey);
        } else {
            this.startDrag(rowKey, colKey);
        }
    }

    handleKeyDown(e: KeyboardEvent, rowKey: WordKey, colKey: WordColumnKey) {
        const inEditMode =
            this.editCell?.rowKey === rowKey &&
            this.editCell?.colKey === colKey;

        if (!inEditMode) {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    this._navigate(rowKey, colKey, 1, 0);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this._navigate(rowKey, colKey, -1, 0);
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    this._navigate(rowKey, colKey, 0, -1);
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    this._navigate(rowKey, colKey, 0, 1);
                    break;
                case "Enter":
                    e.preventDefault();
                    this.startEdit(rowKey, colKey);
                    break;
            }
        } else {
            switch (e.key) {
                case "Enter":
                    e.preventDefault();
                    this.commitEdit();
                    this._navigate(rowKey, colKey, 1, 0);
                    break;
                case "Escape":
                    e.preventDefault();
                    this.cancelEdit();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    this.commitEdit();
                    this._navigate(rowKey, colKey, 1, 0);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this.commitEdit();
                    this._navigate(rowKey, colKey, -1, 0);
                    break;
                case "Tab":
                    e.preventDefault();
                    this.commitEdit();
                    if (e.shiftKey) {
                        this._navigate(rowKey, colKey, 0, -1);
                    } else {
                        this._navigate(rowKey, colKey, 0, 1);
                    }
                    break;
            }
        }
    }

    private _navigate(
        rowKey: WordKey,
        colKey: WordColumnKey,
        dr: number,
        dc: number,
    ) {
        const visible = this.visibleRows;
        const rowIdx = visible.findIndex((r) => r.key === rowKey);
        const colIdx = WORD_COLUMNS.indexOf(colKey);
        const newRowIdx = rowIdx + dr;
        const newColIdx = colIdx + dc;
        if (newRowIdx < 0 || newRowIdx >= visible.length) return;
        if (newColIdx < 0 || newColIdx >= WORD_COLUMNS.length) return;
        const targetRowKey = visible[newRowIdx].key;
        const targetColKey = WORD_COLUMNS[newColIdx];
        this.selectSingle(targetRowKey, targetColKey);
        document
            .getElementById(`word-cell-${targetRowKey}-${targetColKey}`)
            ?.scrollIntoView({
                behavior: "instant",
                block: "nearest",
                inline: "nearest",
            });
    }

    // DATA

    load(words: WordResponse[], languageId: number) {
        this._languageId = languageId;
        this._keyCounter = 0;
        this._rows = words.map((w) => ({
            key: String(w.id),
            wordType: w.wordType,
            languageId: w.languageId,
            id: w.id,
            cells: {
                spelling: { value: w.spelling },
                definition: { value: w.definition },
                translations: { value: w.translations.join(", ") },
            },
        }));
        this._addSentinel();
    }

    async removeRow(key: WordKey) {
        if (key === this._sentinelKey) return;
        const row = this._rows.find((r) => r.key === key);
        if (!row) return;

        if (row.id !== null) {
            const success = await this._domain.words.delete(row.id);
            if (!success) return;
        }

        const idx = this._rows.findIndex((r) => r.key === key);
        if (idx >= 0) this._rows.splice(idx, 1);
        this._modifiedKeys.delete(key);

        const prefix = `${key}-`;
        const entries = [...this.selectedCells];
        this.selectedCells.clear();
        for (const posKey of entries) {
            if (!posKey.startsWith(prefix)) this.selectedCells.add(posKey);
        }

        if (this.editCell?.rowKey === key) this.editCell = null;
    }

    claimModifiedWords(): Word[] {
        const result: Word[] = [];
        for (const key of this._modifiedKeys) {
            const row = this._rows.find((r) => r.key === key);
            if (!row) continue;
            result.push({
                key,
                id: row.id,
                wordType: row.wordType,
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
        this._modifiedKeys.clear();
        return result;
    }

    handleSynchronization(words: Word[]) {
        for (const word of words) {
            const row = this._rows.find((r) => r.key === word.key);
            if (row) row.id = word.id;
        }
    }

    cleanUp() {
        this._modifiedKeys.clear();
        this.editCell = null;
        this.selectedCells.clear();
        this._selectionAnchor = null;
    }

    // PRIVATE HELPERS

    private _nextKey(): WordKey {
        return `N${this._keyCounter++}`;
    }

    private _addSentinel() {
        this._sentinelKey = this._nextKey();
        this._rows.push({
            key: this._sentinelKey,
            wordType: WordType.None,
            languageId: this._languageId,
            id: null,
            cells: {
                spelling: { value: "" },
                definition: { value: "" },
                translations: { value: "" },
            },
        });
    }
}

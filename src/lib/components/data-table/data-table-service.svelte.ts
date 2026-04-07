import { SvelteSet } from "svelte/reactivity";

import type {
    ColumnDef,
    DataRow,
    PositionKey,
    SelectionAnchor,
} from "./data-table-interface";

export interface TableServiceConfig<TColKey extends string> {
    columns: ColumnDef<TColKey>[];
    filterRow?: (row: DataRow<TColKey>) => boolean;
    onCancelEdit?: (rowKey: string, colKey: TColKey) => void;
    onSetValue?: (rowKey: string, colKey: TColKey, value: string) => void;
}

export class TableService<TColKey extends string> {
    private _config: TableServiceConfig<TColKey>;
    private _selectionAnchor: SelectionAnchor<TColKey> | null = null;
    private _isDragging = false;

    rows: DataRow<TColKey>[] = $state([]);
    modifiedKeys = new SvelteSet<string>();
    selectedCells = new SvelteSet<PositionKey>();
    editCell: { rowKey: string; colKey: TColKey } | null = $state(null);
    editSelectAll = true;
    selectContentEl: HTMLElement | null = null;
    focusGrid: (() => void) | undefined = undefined;

    constructor(config: TableServiceConfig<TColKey>) {
        this._config = config;
    }

    // PROPERTIES

    get columns(): ColumnDef<TColKey>[] {
        return this._config.columns;
    }

    get visibleRows(): DataRow<TColKey>[] {
        return this._config.filterRow
            ? this.rows.filter(this._config.filterRow)
            : this.rows;
    }

    get activeCell(): { rowKey: string; colKey: TColKey } | null {
        if (!this._selectionAnchor) return null;
        const rowKeys = this.visibleRows.map((r) => r.key);
        const idx = this._selectionAnchor.rowIndex;
        if (idx < 0 || idx >= rowKeys.length) return null;
        return { rowKey: rowKeys[idx], colKey: this._selectionAnchor.colKey };
    }

    // DATA

    load(rows: DataRow<TColKey>[]) {
        this.rows = rows;
        this.reset();
    }

    setValue(rowKey: string, colKey: TColKey, value: string) {
        const row = this.rows.find((r) => r.key === rowKey);
        if (!row) return;
        row.cells[colKey].value = value;
        this.modifiedKeys.add(rowKey);
        this._config.onSetValue?.(rowKey, colKey, value);
    }

    findRow(rowKey: string): DataRow<TColKey> | undefined {
        return this.rows.find((r) => r.key === rowKey);
    }

    addRow(row: DataRow<TColKey>) {
        this.rows.push(row);
    }

    removeRow(rowKey: string) {
        const idx = this.rows.findIndex((r) => r.key === rowKey);
        if (idx < 0) return;
        this.rows.splice(idx, 1);
        this.modifiedKeys.delete(rowKey);
        const prefix = `${rowKey}-`;
        const entries = [...this.selectedCells];
        this.selectedCells.clear();
        for (const posKey of entries) {
            if (!posKey.startsWith(prefix)) this.selectedCells.add(posKey);
        }
        if (this.editCell?.rowKey === rowKey) this.editCell = null;
    }

    findColumn(colKey: TColKey): ColumnDef<TColKey> | undefined {
        return this._config.columns.find((c) => c.key === colKey);
    }

    // SELECTION

    selectSingle(rowKey: string, colKey: TColKey) {
        this.selectedCells.clear();
        this.selectedCells.add(`${rowKey}-${colKey}`);
        const rowIdx = this.visibleRows.map((r) => r.key).indexOf(rowKey);
        this._selectionAnchor =
            rowIdx >= 0 ? { rowIndex: rowIdx, colKey } : null;
    }

    selectRange(rowKey: string, colKey: TColKey) {
        if (!this._selectionAnchor) {
            this.selectSingle(rowKey, colKey);
            return;
        }
        const rowKeys = this.visibleRows.map((r) => r.key);
        const colKeys = this._config.columns.map((c) => c.key);
        const targetRowIdx = rowKeys.indexOf(rowKey);
        if (targetRowIdx < 0) return;

        const minRow = Math.min(this._selectionAnchor.rowIndex, targetRowIdx);
        const maxRow = Math.max(this._selectionAnchor.rowIndex, targetRowIdx);
        const anchorColIdx = colKeys.indexOf(this._selectionAnchor.colKey);
        const targetColIdx = colKeys.indexOf(colKey);
        const minCol = Math.min(anchorColIdx, targetColIdx);
        const maxCol = Math.max(anchorColIdx, targetColIdx);

        this.selectedCells.clear();
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                this.selectedCells.add(`${rowKeys[r]}-${colKeys[c]}`);
            }
        }
    }

    toggleCell(rowKey: string, colKey: TColKey) {
        const posKey = `${rowKey}-${colKey}`;
        if (this.selectedCells.has(posKey)) {
            this.selectedCells.delete(posKey);
        } else {
            this.selectedCells.add(posKey);
        }
        const rowIdx = this.visibleRows.map((r) => r.key).indexOf(rowKey);
        this._selectionAnchor =
            rowIdx >= 0 ? { rowIndex: rowIdx, colKey } : null;
    }

    startDrag(rowKey: string, colKey: TColKey) {
        this._isDragging = true;
        this.selectSingle(rowKey, colKey);
    }

    dragTo(rowKey: string, colKey: TColKey) {
        if (!this._isDragging) return;
        this.selectRange(rowKey, colKey);
    }

    endDrag() {
        this._isDragging = false;
    }

    // EDITING

    get isEditing() {
        return this.editCell !== null;
    }

    isEditable(rowKey: string, colKey: TColKey): boolean {
        return (
            this.editCell?.rowKey === rowKey && this.editCell?.colKey === colKey
        );
    }

    startEdit(rowKey: string, colKey: TColKey) {
        const row = this.rows.find((r) => r.key === rowKey);
        if (row) row.cells[colKey].oldValue = row.cells[colKey].value;
        this.editSelectAll = true;
        this.editCell = { rowKey, colKey };
        this.selectSingle(rowKey, colKey);
    }

    startEditWithChar(rowKey: string, colKey: TColKey, char: string) {
        this.startEdit(rowKey, colKey);
        this.editSelectAll = false;
        this.setValue(rowKey, colKey, char);
    }

    commitEdit() {
        if (!this.editCell) return;
        const { rowKey, colKey } = this.editCell;
        const row = this.rows.find((r) => r.key === rowKey);
        if (row) row.cells[colKey].oldValue = undefined;
        this.editCell = null;
    }

    cancelEdit() {
        if (!this.editCell) return;
        const { rowKey, colKey } = this.editCell;
        const row = this.rows.find((r) => r.key === rowKey);
        if (row && row.cells[colKey].oldValue !== undefined) {
            row.cells[colKey].value = row.cells[colKey].oldValue!;
            row.cells[colKey].oldValue = undefined;
        }
        this._config.onCancelEdit?.(rowKey, colKey);
        this.editCell = null;
    }

    reset() {
        this.selectedCells.clear();
        this.editCell = null;
        this._selectionAnchor = null;
        this._isDragging = false;
        this.modifiedKeys.clear();
    }

    // MOUSE

    handleCellMouseDown(e: MouseEvent, rowKey: string, colKey: TColKey) {
        if (this.isEditable(rowKey, colKey)) return;
        if (this.isEditing) this.commitEdit();

        const posKey = `${rowKey}-${colKey}`;
        if (e.shiftKey) {
            e.preventDefault();
            this.selectRange(rowKey, colKey);
        } else if (e.ctrlKey || e.metaKey) {
            this.toggleCell(rowKey, colKey);
        } else if (!this.selectedCells.has(posKey)) {
            this.startDrag(rowKey, colKey);
        }
    }

    // KEYBOARD

    handleTableKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) return;
        const active = this.activeCell;
        if (!active) return;
        this.handleKeyDown(e, active.rowKey, active.colKey);
    }

    handleKeyDown(e: KeyboardEvent, rowKey: string, colKey: TColKey) {
        if (this.isEditable(rowKey, colKey)) {
            this._handleKeyDownEditing(e, rowKey, colKey);
        } else {
            this._handleKeyDownNavigating(e, rowKey, colKey);
        }
    }

    private _handleKeyDownNavigating(
        e: KeyboardEvent,
        rowKey: string,
        colKey: TColKey,
    ) {
        const isSelect = this.findColumn(colKey)?.type === "select";

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
            default:
                if (
                    e.key.length === 1 &&
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !e.altKey &&
                    !isSelect
                ) {
                    e.preventDefault();
                    this.startEditWithChar(rowKey, colKey, e.key);
                }
                break;
        }
    }

    private _handleKeyDownEditing(
        e: KeyboardEvent,
        rowKey: string,
        colKey: TColKey,
    ) {
        const isSelect = this.findColumn(colKey)?.type === "select";

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
                if (isSelect) break;
                e.preventDefault();
                this.commitEdit();
                this._navigate(rowKey, colKey, 1, 0);
                break;
            case "ArrowUp":
                if (isSelect) break;
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

    scrollCellIntoView(rowKey: string, colKey: TColKey) {
        document
            .getElementById(`cell-${rowKey}-${colKey}`)
            ?.scrollIntoView({
                behavior: "instant",
                block: "nearest",
                inline: "nearest",
            });
    }

    private _navigate(rowKey: string, colKey: TColKey, dr: number, dc: number) {
        const rowKeys = this.visibleRows.map((r) => r.key);
        const colKeys = this._config.columns.map((c) => c.key);
        const rowIdx = rowKeys.indexOf(rowKey);
        const colIdx = colKeys.indexOf(colKey);
        const newRowIdx = rowIdx + dr;
        const newColIdx = colIdx + dc;
        if (newRowIdx < 0 || newRowIdx >= rowKeys.length) return;
        if (newColIdx < 0 || newColIdx >= colKeys.length) return;
        const targetRowKey = rowKeys[newRowIdx];
        const targetColKey = colKeys[newColIdx];
        this.selectSingle(targetRowKey, targetColKey);
        this.scrollCellIntoView(targetRowKey, targetColKey);
    }
}

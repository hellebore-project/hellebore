import { SvelteSet } from "svelte/reactivity";

import type { IComponentService } from "@/interface";

import type {
    DataColumn,
    DataRow,
    PositionKey,
    SelectionAnchor,
} from "./data-table-interface";

export interface DataTableServiceArgs<TColKey extends string> {
    id: string;
    columns: DataColumn<TColKey>[];
    pageCount?: number;
    onFilter?: (colKey: TColKey, values: string[]) => void;
    onCancelEdit?: (rowKey: string, colKey: TColKey) => void;
    onSetValue?: (rowKey: string, colKey: TColKey, value: string) => void;
    onPageChange?: (page: number) => void;
}

export class DataTableService<
    TColKey extends string,
> implements IComponentService {
    // STATE VARIABLES
    private _id: string;
    rows: DataRow<TColKey>[] = $state([]);
    private _columns: DataColumn<TColKey>[];
    modifiedKeys = new SvelteSet<string>();
    selectedCells = new SvelteSet<PositionKey>();
    private _selectionAnchor: SelectionAnchor<TColKey> | null = null;
    private _isDragging = false;
    editCell: { rowKey: string; colKey: TColKey } | null = $state(null);
    selectOpen: boolean = $state(false);
    editSelectAll = true;
    private _columnFilters: Record<string, string[]> = $state({});
    page: number = $state(1);
    pageCount: number = $state(1);

    // CALLBACKS
    focusGrid: (() => void) | undefined = undefined;
    private _onFilter:
        | ((colKey: TColKey, values: string[]) => void)
        | undefined;
    private _onCancelEdit:
        | ((rowKey: string, colKey: TColKey) => void)
        | undefined;
    private _onSetValue:
        | ((rowKey: string, colKey: TColKey, value: string) => void)
        | undefined;
    private _onPageChange: ((page: number) => void) | undefined;

    constructor({
        id,
        columns,
        pageCount,
        onFilter,
        onCancelEdit,
        onSetValue,
        onPageChange,
    }: DataTableServiceArgs<TColKey>) {
        this._id = id;
        this._columns = columns;
        if (pageCount !== undefined) this.pageCount = pageCount;
        this._onFilter = onFilter;
        this._onCancelEdit = onCancelEdit;
        this._onSetValue = onSetValue;
        this._onPageChange = onPageChange;
    }

    // PROPERTIES

    get id() {
        return this._id;
    }

    get headerId() {
        return `${this._id}-header`;
    }

    get columns(): DataColumn<TColKey>[] {
        return this._columns;
    }

    get visibleRows(): DataRow<TColKey>[] {
        return this.rows.filter((row) => {
            if (row.filterable === false) return true;
            for (const [colKey, values] of Object.entries(
                this._columnFilters,
            )) {
                const col = this.findColumn(colKey as TColKey);
                const cellValue = row.cells[colKey as TColKey].value;
                if (col?.type === "text") {
                    if (
                        !cellValue
                            .toLowerCase()
                            .includes(values[0].toLowerCase())
                    ) {
                        return false;
                    }
                } else {
                    if (!values.includes(cellValue)) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    getColumnFilter(colKey: TColKey): string[] {
        return this._columnFilters[colKey] ?? [];
    }

    getTextColumnFilter(colKey: TColKey): string {
        return this._columnFilters[colKey]?.[0] ?? "";
    }

    setTextColumnFilter(colKey: TColKey, value: string) {
        if (value === "") {
            this.clearColumnFilter(colKey);
        } else {
            this.setColumnFilter(colKey, [value]);
        }
    }

    isColumnFiltered(colKey: TColKey): boolean {
        return colKey in this._columnFilters;
    }

    isColumnFilterChecked(colKey: TColKey, value: string): boolean {
        if (!(colKey in this._columnFilters)) return true;
        return this._columnFilters[colKey].includes(value);
    }

    clearColumnFilter(colKey: TColKey) {
        delete this._columnFilters[colKey];
        this.selectedCells.clear();
        this.editCell = null;
        this._selectionAnchor = null;
        this._onFilter?.(colKey, []);
    }

    toggleColumnFilter(colKey: TColKey, value: string) {
        const col = this.findColumn(colKey);
        if (!col || col.type !== "select") return;
        const allValues = col.items.map((i) => i.value);
        const current =
            colKey in this._columnFilters
                ? [...this._columnFilters[colKey]]
                : [...allValues];
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        if (next.length === allValues.length) {
            this.clearColumnFilter(colKey);
        } else {
            this.setColumnFilter(colKey, next);
        }
    }

    setColumnFilter(colKey: TColKey, values: string[]) {
        this._columnFilters[colKey] = values;
        this.selectedCells.clear();
        this.editCell = null;
        this._selectionAnchor = null;
        this._onFilter?.(colKey, values);
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
        const row = this.findRow(rowKey);
        if (!row) return;
        row.cells[colKey].value = value;
        this.modifiedKeys.add(rowKey);
        this._onSetValue?.(rowKey, colKey, value);
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

    findColumn(colKey: TColKey): DataColumn<TColKey> | undefined {
        return this._columns.find((c) => c.key === colKey);
    }

    // SELECTION

    private _moveSelection(
        rowKey: string,
        colKey: TColKey,
        dr: number,
        dc: number,
    ) {
        const rowKeys = this.visibleRows.map((r) => r.key);
        const colKeys = this._columns.map((c) => c.key);
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
        const colKeys = this._columns.map((c) => c.key);
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

    canMove(rowKey: string, colKey: TColKey, dr: number, dc: number): boolean {
        const rowKeys = this.visibleRows.map((r) => r.key);
        const colKeys = this._columns.map((c) => c.key);
        const rowIdx = rowKeys.indexOf(rowKey);
        const colIdx = colKeys.indexOf(colKey);
        const newRowIdx = rowIdx + dr;
        const newColIdx = colIdx + dc;
        return (
            newRowIdx >= 0 &&
            newRowIdx < rowKeys.length &&
            newColIdx >= 0 &&
            newColIdx < colKeys.length
        );
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
        const row = this.findRow(rowKey);
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
        const row = this.findRow(rowKey);
        if (row) row.cells[colKey].oldValue = undefined;
        this.editCell = null;
    }

    cancelEdit() {
        if (!this.editCell) return;
        const { rowKey, colKey } = this.editCell;
        const row = this.findRow(rowKey);
        if (row && row.cells[colKey].oldValue !== undefined) {
            row.cells[colKey].value = row.cells[colKey].oldValue!;
            row.cells[colKey].oldValue = undefined;
        }
        this._onCancelEdit?.(rowKey, colKey);
        this.editCell = null;
    }

    // MOUSE

    handleCellMouseDown(e: MouseEvent, rowKey: string, colKey: TColKey) {
        if (this.isEditable(rowKey, colKey)) return;
        if (this.isEditing) this.commitEdit();

        if (e.shiftKey) {
            e.preventDefault();
            this.selectRange(rowKey, colKey);
        } else if (e.ctrlKey || e.metaKey) {
            this.toggleCell(rowKey, colKey);
        } else {
            this.startDrag(rowKey, colKey);
        }
    }

    // KEYBOARD

    handleTableKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) return;

        const active = this.activeCell;
        if (!active) return;
        const { rowKey, colKey } = active;

        if (this._handleSelectDropdownKeyDown(e, rowKey, colKey)) return;

        const wasEditing = this.isEditing;
        this.handleKeyDown(e, rowKey, colKey);

        if (wasEditing && !this.isEditing) this.focusGrid?.();
    }

    private _handleSelectDropdownKeyDown(
        e: KeyboardEvent,
        rowKey: string,
        colKey: TColKey,
    ) {
        // When a select cell's dropdown is open, bits-ui handles ArrowUp/Down/Enter natively.
        // We only intercept lateral navigation to commit and leave the cell.

        const isSelect = this.findColumn(colKey)?.type === "select";
        if (!isSelect || !this.isEditable(rowKey, colKey) || !this.selectOpen)
            return false;

        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return true;

        const dc = e.key === "ArrowLeft" ? -1 : 1;
        if (!this.canMove(rowKey, colKey, 0, dc)) return true;

        e.preventDefault();
        e.stopPropagation();

        this.commitEdit();
        this._moveSelection(rowKey, colKey, 0, dc);
        this.focusGrid?.();

        return true;
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
                this._moveSelection(rowKey, colKey, 1, 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                if (this.visibleRows[0]?.key === rowKey) {
                    this.scrollHeaderIntoView();
                } else {
                    this._moveSelection(rowKey, colKey, -1, 0);
                }
                break;
            case "ArrowLeft":
                e.preventDefault();
                this._moveSelection(rowKey, colKey, 0, -1);
                break;
            case "ArrowRight":
                e.preventDefault();
                this._moveSelection(rowKey, colKey, 0, 1);
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
                if (isSelect) e.stopPropagation();
                this.commitEdit();
                if (!isSelect) this._moveSelection(rowKey, colKey, 1, 0);
                break;
            case "Escape":
                e.preventDefault();
                if (isSelect) e.stopPropagation();
                this.cancelEdit();
                break;
            case "ArrowDown":
                if (isSelect) break;
                e.preventDefault();
                this.commitEdit();
                this._moveSelection(rowKey, colKey, 1, 0);
                break;
            case "ArrowUp":
                if (isSelect) break;
                e.preventDefault();
                this.commitEdit();
                this._moveSelection(rowKey, colKey, -1, 0);
                break;
            case "ArrowLeft":
                if (!isSelect) break;
                if (!this.canMove(rowKey, colKey, 0, -1)) break;
                e.preventDefault();
                this.commitEdit();
                this._moveSelection(rowKey, colKey, 0, -1);
                break;
            case "ArrowRight":
                if (!isSelect) break;
                if (!this.canMove(rowKey, colKey, 0, 1)) break;
                e.preventDefault();
                this.commitEdit();
                this._moveSelection(rowKey, colKey, 0, 1);
                break;
            case "Tab":
                e.preventDefault();
                this.commitEdit();
                if (e.shiftKey) {
                    this._moveSelection(rowKey, colKey, 0, -1);
                } else {
                    this._moveSelection(rowKey, colKey, 0, 1);
                }
                break;
        }
    }

    // SCROLLING

    scrollCellIntoView(rowKey: string, colKey: TColKey) {
        document.getElementById(`cell-${rowKey}-${colKey}`)?.scrollIntoView({
            behavior: "instant",
            block: "nearest",
            inline: "nearest",
        });
    }

    scrollHeaderIntoView() {
        document.getElementById(this.headerId)?.scrollIntoView({
            behavior: "instant",
            block: "nearest",
            inline: "nearest",
        });
    }

    // PAGINATION

    changePage(page: number) {
        this.page = page;
        this._onPageChange?.(page);
    }

    // CLEAN UP

    reset() {
        this.selectedCells.clear();
        this.editCell = null;
        this._selectionAnchor = null;
        this._isDragging = false;
        this.modifiedKeys.clear();
    }
}

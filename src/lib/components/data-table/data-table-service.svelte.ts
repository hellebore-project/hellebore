import { SvelteMap, SvelteSet } from "svelte/reactivity";

import { PredicateType, type FilterPredicate } from "@/api";
import { ChangePageAction } from "@/constants";
import type { ChangePageEvent, IComponentService } from "@/interface";
import { PaginationService } from "@/lib/components/pagination";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

import type {
    DataCellEvent,
    DataCellEditEvent,
    DataColumn,
    DataRow,
    DataCellKeyString,
    SelectionAnchor,
    DataCellKey,
    DataTableQueryRequest,
    DataTableFilterItem,
    DataTableQueryResult,
    DataTableQueryEvent,
    //DataTableSortItem,
} from "./data-table-interface";

export interface DataTableServiceArgs<
    TColKey extends string,
    TColMetaData = object,
> {
    id: string;
    columns: DataColumn<TColKey, TColMetaData>[];
    pageCount?: number;
    rowPerPageCount?: number;
}

export class DataTableService<
    TColKey extends string,
    TRowMetaData = object,
    TColMetaData = object,
> implements IComponentService {
    // STATE VARIABLES

    private _id: string;

    private _rows: DataRow<TColKey, TRowMetaData>[] = $state([]);
    private _columns: DataColumn<TColKey, TColMetaData>[];

    modifiedKeys = new SvelteSet<string>();

    private _offset: number | null = null;
    private _limit: number = $state(10);

    selectedCells = new SvelteSet<DataCellKeyString>();
    private _selectionAnchor: SelectionAnchor<TColKey> | null = null;
    private _isDragging = false;

    editableCellKey: DataCellKey<TColKey> | null = $state(null);
    selectOpen: boolean = $state(false);
    editSelectAll = true;

    private _columnFilters: SvelteMap<
        TColKey,
        FilterPredicate<number | string>
    > = $state(new SvelteMap());
    //private _columnSortOrders: DataTableSortItem<TColKey>[] = $state([]);

    // SERVICES
    pagination: PaginationService;

    // REFERENCES
    focusGrid: (() => void) | undefined = undefined;

    // EVENTS
    onQueryData: EventProducer<
        DataTableQueryRequest<TColKey>,
        Promise<DataTableQueryResult<DataRow<TColKey, TRowMetaData>> | null>
    >;
    onCancelEdit: MultiEventProducer<DataCellEvent<TColKey>, unknown>;
    onSetValue: MultiEventProducer<DataCellEditEvent<TColKey>, unknown>;

    constructor({
        id,
        columns,
        pageCount,
        rowPerPageCount = 10,
    }: DataTableServiceArgs<TColKey, TColMetaData>) {
        this._id = id;
        this._columns = columns;

        this._limit = rowPerPageCount;

        this.pagination = new PaginationService({
            id: `${id}-pagination`,
            count: pageCount,
            controlled: true,
        });
        this.pagination.onChangePage.subscribe((event) =>
            this._onChangePage(event),
        );

        this.onQueryData = new EventProducer();
        this.onCancelEdit = new MultiEventProducer();
        this.onSetValue = new MultiEventProducer();
    }

    // IDENTIFIERS

    get id() {
        return this._id;
    }

    get headerId() {
        return `${this._id}-header`;
    }

    // LOADING

    async load(rows?: DataRow<TColKey, TRowMetaData>[] | null) {
        this.reset();

        if (rows) {
            this._rows = rows;
            this._offset = 0;
            this.pagination.setCount(1);
        } else
            await this._queryData({
                pageAction: ChangePageAction.FirstPage,
            });
    }

    private async _queryData({
        pageAction = ChangePageAction.FirstPage,
        oldPageIndex = null,
        newPageIndex = null,
    }: DataTableQueryEvent) {
        oldPageIndex = oldPageIndex ?? this.pagination.page;
        newPageIndex = newPageIndex ?? this.pagination.page;

        const filters: Partial<Record<TColKey, DataTableFilterItem>> = {};
        for (const [colKey, predicate] of this._columnFilters.entries())
            filters[colKey] = { predicate };

        const result = await this.onQueryData.produce({
            pagination: {
                action: pageAction,
                oldPageIndex,
                newPageIndex,
                pageCount: this.pagination.count,
                oldOffset: this._offset,
                limit: this._limit,
            },
            sortation: [], // TODO
            filters,
        });

        if (!result) {
            this._rows = [];
            this._offset = null;
            this.pagination.reset();
            console.error(`${this.id} failed to fetch data.`);
            return;
        }

        this._rows = result.items;
        this._offset = result.pagination?.offset ?? null;
        this.pagination.setPage(result.pagination?.pageIndex ?? newPageIndex);
        this.pagination.setCount(result.pagination?.pageCount ?? null);
    }

    // ROWS

    get rows(): DataRow<TColKey, TRowMetaData>[] {
        return this._rows;
    }

    get visibleRows(): DataRow<TColKey, TRowMetaData>[] {
        return this.rows;
    }

    findRow(rowKey: string): DataRow<TColKey, TRowMetaData> | undefined {
        return this._rows.find((r) => r.key === rowKey);
    }

    appendRow(row: DataRow<TColKey, TRowMetaData>) {
        this._rows.push(row);
    }

    insertRow(index: number, row: DataRow<TColKey, TRowMetaData>) {
        const boundedIndex = Math.max(0, Math.min(index, this._rows.length));
        this._rows.splice(boundedIndex, 0, row);

        if (
            this._selectionAnchor &&
            boundedIndex <= this._selectionAnchor.rowIndex
        )
            this._selectionAnchor.rowIndex++;
    }

    removeRow(rowKey: string) {
        const idx = this._rows.findIndex((r) => r.key === rowKey);
        if (idx < 0) return;
        this._rows.splice(idx, 1);
        this.modifiedKeys.delete(rowKey);
        const prefix = `${rowKey}-`;
        const entries = [...this.selectedCells];
        this.selectedCells.clear();
        for (const posKey of entries) {
            if (!posKey.startsWith(prefix)) this.selectedCells.add(posKey);
        }
        if (this.editableCellKey?.rowKey === rowKey)
            this.editableCellKey = null;
    }

    // COLUMNS

    get columns(): DataColumn<TColKey, TColMetaData>[] {
        return this._columns;
    }

    findColumn(colKey: TColKey): DataColumn<TColKey, TColMetaData> | undefined {
        return this._columns.find((c) => c.key === colKey);
    }

    // SELECTION

    get activeCell(): { rowKey: string; colKey: TColKey } | null {
        if (!this._selectionAnchor) return null;
        const rowKeys = this.visibleRows.map((r) => r.key);
        const idx = this._selectionAnchor.rowIndex;
        if (idx < 0 || idx >= rowKeys.length) return null;
        return { rowKey: rowKeys[idx], colKey: this._selectionAnchor.colKey };
    }

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

        let newRowIdx = rowIdx + dr;
        let newColIdx = colIdx + dc;

        if (newRowIdx < 0 || newRowIdx >= rowKeys.length) newRowIdx = rowIdx;
        if (newColIdx < 0 || newColIdx >= colKeys.length) newColIdx = colIdx;

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

    selectRange(rowKey: string, colKey: TColKey, newAnchor = false) {
        // rowKey and colKey correspond to the endpoint of the range

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
            for (let c = minCol; c <= maxCol; c++)
                this.selectedCells.add(`${rowKeys[r]}-${colKeys[c]}`);
        }

        if (newAnchor)
            this._selectionAnchor = { rowIndex: targetRowIdx, colKey };
    }

    toggleCell(rowKey: string, colKey: TColKey) {
        const posKey = `${rowKey}-${colKey}`;
        if (this.selectedCells.has(posKey)) {
            this.selectedCells.delete(posKey);
        } else this.selectedCells.add(posKey);

        const rowIdx = this.visibleRows.map((r) => r.key).indexOf(rowKey);
        // select a new anchor for the selection
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

    clearSelection() {
        this.selectedCells.clear();
        this._selectionAnchor = null;
    }

    // PAGINATION

    get rowPerPageCount() {
        return this._limit;
    }

    _onChangePage({ action, newPageIndex }: ChangePageEvent) {
        this._queryData({ pageAction: action, newPageIndex });
    }

    // FILTERING

    isColumnFiltered(colKey: TColKey): boolean {
        return this._columnFilters.has(colKey);
    }

    getColumnFilter(colKey: TColKey) {
        return this._columnFilters.get(colKey) ?? null;
    }

    setColumnFilter(
        colKey: TColKey,
        predicate: FilterPredicate<string | number>,
    ) {
        this.clearSelection();

        const col = this.findColumn(colKey);
        if (!col) {
            this._columnFilters.delete(colKey);
            return;
        }

        if (col.fieldType == "select" && predicate.type == PredicateType.In) {
            const allValues = col.items.map((i) => i.value);
            if (allValues.length == predicate.values.length)
                // special case: if all possible options are filtered in,
                // then we can clear the filter
                this._columnFilters.delete(colKey);
            else this._columnFilters.set(colKey, predicate);
        } else this._columnFilters.set(colKey, predicate);

        this._onChangeFilter();
    }

    clearColumnFilter(colKey: TColKey) {
        this.clearSelection();
        this._columnFilters.delete(colKey);
        this._onChangeFilter();
    }

    getTextColumnFilter(colKey: TColKey): number | string | null {
        const predicate = this.getColumnFilter(colKey);
        if (!predicate) return null;

        // NOTE: text columns only support LIKE operations
        if (predicate.type != PredicateType.Like) return null;

        return predicate.value;
    }

    setTextColumnFilter(colKey: TColKey, value: string) {
        if (value === "") this.clearColumnFilter(colKey);
        else this.setColumnFilter(colKey, { type: PredicateType.Like, value });
    }

    isSelectColumnFilterChecked(colKey: TColKey, value: string): boolean {
        const values = this.getSelectColumnFilter(colKey);
        if (values === null)
            // if no filter is applied, then the option in question must be checked
            return true;
        return values.includes(value);
    }

    getSelectColumnFilter(colKey: TColKey): (number | string)[] | null {
        const predicate = this.getColumnFilter(colKey);
        if (!predicate) return null;

        // NOTE: select columns only support IN operations
        if (predicate.type != PredicateType.In) return null;

        return predicate.values;
    }

    toggleSelectColumnFilterOption(
        colKey: TColKey,
        value: string,
        include: boolean,
    ) {
        const col = this.findColumn(colKey);
        if (!col || col.fieldType !== "select") return;

        let predicate = this.getColumnFilter(colKey);
        if (!predicate || predicate.type != PredicateType.In) {
            predicate = { type: PredicateType.In, values: [] };
        }

        const alreadyIncluded = predicate.values.includes(value);

        if (alreadyIncluded && !include)
            predicate.values = predicate.values.filter((v) => v != value);
        else if (!alreadyIncluded && include) predicate.values.push(value);

        this.setColumnFilter(colKey, predicate);
    }

    private _onChangeFilter() {
        this._queryData({});
    }

    // EDITING

    get isEditingCell() {
        return this.editableCellKey !== null;
    }

    setCellValue(rowKey: string, colKey: TColKey, value: string) {
        const row = this.findRow(rowKey);
        if (!row) return;
        row.cells[colKey].value = value;
        this.modifiedKeys.add(rowKey);
        this.onSetValue?.produce({ rowKey, colKey, value });
    }

    isCellEditable(rowKey: string, colKey: TColKey): boolean {
        return (
            this.editableCellKey?.rowKey === rowKey &&
            this.editableCellKey?.colKey === colKey
        );
    }

    startCellEdit(rowKey: string, colKey: TColKey) {
        const row = this.findRow(rowKey);
        if (row) row.cells[colKey].oldValue = row.cells[colKey].value;
        this.editSelectAll = true;
        this.editableCellKey = { rowKey, colKey };
        this.selectSingle(rowKey, colKey);
    }

    startCellEditWithChar(rowKey: string, colKey: TColKey, char: string) {
        this.startCellEdit(rowKey, colKey);
        this.editSelectAll = false;
        this.setCellValue(rowKey, colKey, char);
    }

    commitCellEdit() {
        if (!this.editableCellKey) return;
        const { rowKey, colKey } = this.editableCellKey;
        const row = this.findRow(rowKey);
        if (row) row.cells[colKey].oldValue = undefined;
        this.editableCellKey = null;
    }

    cancelCellEdit() {
        if (!this.editableCellKey) return;
        const { rowKey, colKey } = this.editableCellKey;
        const row = this.findRow(rowKey);
        if (row && row.cells[colKey].oldValue !== undefined) {
            row.cells[colKey].value = row.cells[colKey].oldValue!;
            row.cells[colKey].oldValue = undefined;
        }
        this.onCancelEdit?.produce({ rowKey, colKey });
        this.editableCellKey = null;
    }

    // MOUSE

    handleCellMouseDown(e: MouseEvent, rowKey: string, colKey: TColKey) {
        if (this.isCellEditable(rowKey, colKey)) return;
        if (this.isEditingCell) this.commitCellEdit();

        if (e.shiftKey) {
            e.preventDefault();
            this.selectRange(rowKey, colKey, true);
        } else if (e.ctrlKey || e.metaKey) {
            this.toggleCell(rowKey, colKey);
        } else {
            this.startDrag(rowKey, colKey);
        }
    }

    // KEYBOARD

    handleKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) return;

        const active = this.activeCell;
        if (!active) return;
        const { rowKey, colKey } = active;

        if (this._handleSelectDropdownKeyDown(e, rowKey, colKey)) return;

        const wasEditing = this.isEditingCell;

        if (this.isCellEditable(rowKey, colKey)) {
            this._handleKeyDownEditing(e, rowKey, colKey);
        } else {
            this._handleKeyDownNavigating(e, rowKey, colKey);
        }

        if (wasEditing && !this.isEditingCell) this.focusGrid?.();
    }

    private _handleSelectDropdownKeyDown(
        e: KeyboardEvent,
        rowKey: string,
        colKey: TColKey,
    ) {
        // When a select cell's dropdown is open, bits-ui handles ArrowUp/Down/Enter natively.
        // We only intercept lateral navigation to commit and leave the cell.

        const isSelect = this.findColumn(colKey)?.fieldType === "select";
        if (
            !isSelect ||
            !this.isCellEditable(rowKey, colKey) ||
            !this.selectOpen
        )
            return false;

        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return true;

        const dc = e.key === "ArrowLeft" ? -1 : 1;
        if (!this.canMove(rowKey, colKey, 0, dc)) return true;

        e.preventDefault();
        e.stopPropagation();

        this.commitCellEdit();
        this._moveSelection(rowKey, colKey, 0, dc);
        this.focusGrid?.();

        return true;
    }

    private _handleKeyDownNavigating(
        e: KeyboardEvent,
        rowKey: string,
        colKey: TColKey,
    ) {
        const isSelect = this.findColumn(colKey)?.fieldType === "select";

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
                this.startCellEdit(rowKey, colKey);
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
                    this.startCellEditWithChar(rowKey, colKey, e.key);
                }
                break;
        }
    }

    private _handleKeyDownEditing(
        e: KeyboardEvent,
        rowKey: string,
        colKey: TColKey,
    ) {
        const isSelect = this.findColumn(colKey)?.fieldType === "select";

        switch (e.key) {
            case "Enter":
                e.preventDefault();
                if (isSelect) e.stopPropagation();
                this.commitCellEdit();
                if (!isSelect) this._moveSelection(rowKey, colKey, 1, 0);
                break;
            case "Escape":
                e.preventDefault();
                if (isSelect) e.stopPropagation();
                this.cancelCellEdit();
                break;
            case "ArrowDown":
                if (isSelect) break;
                e.preventDefault();
                this.commitCellEdit();
                this._moveSelection(rowKey, colKey, 1, 0);
                break;
            case "ArrowUp":
                if (isSelect) break;
                e.preventDefault();
                this.commitCellEdit();
                this._moveSelection(rowKey, colKey, -1, 0);
                break;
            case "ArrowLeft":
                if (!isSelect) break;
                if (!this.canMove(rowKey, colKey, 0, -1)) break;
                e.preventDefault();
                this.commitCellEdit();
                this._moveSelection(rowKey, colKey, 0, -1);
                break;
            case "ArrowRight":
                if (!isSelect) break;
                if (!this.canMove(rowKey, colKey, 0, 1)) break;
                e.preventDefault();
                this.commitCellEdit();
                this._moveSelection(rowKey, colKey, 0, 1);
                break;
            case "Tab":
                e.preventDefault();
                this.commitCellEdit();
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

    // CLEAN UP

    reset() {
        this._rows = [];

        this.pagination.reset();

        this.clearSelection();
        this._isDragging = false;

        this.editableCellKey = null;

        this.modifiedKeys.clear();
    }
}

import { makeAutoObservable } from "mobx";
import { RefObject, createRef } from "react";

import { FieldType } from "@/constants";
import {
    SpreadsheetCellData,
    SpreadsheetColumnData,
    SpreadsheetRowData,
} from "@/interface";
import {
    AddRowHandler,
    DeleteRowHandler,
    EditCellHandler,
    MutableSpreadsheetCellData,
    MutableSpreadsheetRowData,
} from "./spreadsheet.model";

type PrivateKeys =
    | "_rowCache"
    | "_selectedCellCount"
    | "_onAddRow"
    | "_onDeleteRow"
    | "_onEditCell";

interface SpreadsheetDataServiceArguments<D> {
    onAddRow?: AddRowHandler;
    onDeleteRow?: DeleteRowHandler<D>;
    onEditCell?: EditCellHandler<D>;
}

export class SpreadsheetDataService<D> {
    private _rows: MutableSpreadsheetRowData<D>[];
    private _rowCache: Map<string, MutableSpreadsheetRowData<D>>;
    private _columns: SpreadsheetColumnData[];

    private _selectedCellCount: number = 0;

    private _editableCell: MutableSpreadsheetCellData | null = null;
    private _editableCellField: RefObject<HTMLInputElement> | null = null;

    private _onAddRow?: AddRowHandler;
    private _onDeleteRow?: DeleteRowHandler<D>;
    private _onEditCell?: EditCellHandler<D>;

    constructor({
        onAddRow,
        onDeleteRow,
        onEditCell,
    }: SpreadsheetDataServiceArguments<D>) {
        this._rows = [];
        this._rowCache = new Map();
        this._columns = [];

        this._onAddRow = onAddRow;
        this._onDeleteRow = onDeleteRow;
        this._onEditCell = onEditCell;

        makeAutoObservable<SpreadsheetDataService<D>, PrivateKeys>(this, {
            _rowCache: false,
            _selectedCellCount: false,
            _onAddRow: false,
            _onDeleteRow: false,
            _onEditCell: false,
        });
    }

    get rowCount() {
        return this.rowData.length;
    }

    get rowData() {
        return this._rows;
    }

    get columnCount() {
        return this.columnData.length;
    }

    get columnData() {
        return this._columns;
    }

    get selectedCellCount() {
        return this._selectedCellCount;
    }

    get editableCellElement() {
        return this._editableCellField;
    }

    get editableCell() {
        return this._editableCell;
    }

    get editableCellFieldType() {
        if (!this._editableCell || !this._editableCell.position) return null;

        const col = this._columns[this._editableCell.position.col];
        return col.type;
    }

    initialize(
        rowData: SpreadsheetRowData<D>[],
        columnData: SpreadsheetColumnData[],
    ) {
        this._rows = rowData.map((row) => this._createRow(row));
        this._rowCache.clear();
        this._columns = columnData;
        this._editableCell = null;

        this._cacheRows();
    }

    // ROWS

    addRow(data: SpreadsheetRowData<D>) {
        const row = this._createRow(data);

        const length = this._rows.push(row);
        this._rowCache.set(row.key, this._rows[length - 1]);

        if (this._onAddRow) this._onAddRow();
    }

    deleteRow(key: string) {
        const idx = this._rows.findIndex((r) => r.key === key);
        if (idx < 0) return;

        const [row] = this._rows.splice(idx, 1);
        this._rowCache.delete(row.key);

        if (this._onDeleteRow) this._onDeleteRow(row);
    }

    highlightRow(key: string) {
        const row = this.findRow(key);
        if (row) row.highlighted = true;
    }

    unhighlightRow(key: string) {
        const row = this.findRow(key);
        if (row) row.highlighted = false;
    }

    private _createRow({
        key,
        cells,
        data,
    }: SpreadsheetRowData<D>): MutableSpreadsheetRowData<D> {
        const mutableRow: MutableSpreadsheetRowData<D> = {
            key,
            cells: {},
            highlighted: false,
            data,
        };
        for (const [colKey, cell] of Object.entries(cells)) {
            const cellKey = `${key}-${colKey}`;
            mutableRow.cells[colKey] = this._createCell(cellKey, cell);
        }
        return mutableRow;
    }

    findRow(key: string) {
        let row = this._rowCache.get(key);
        if (row) return row;

        // the row caching strategy is aggressive, so this case shouldn't happen,
        // but we still need to cover it in case of a race condition or a bug
        row = this._rows.find((r) => r.key === key);
        if (!row) return null;

        this._rowCache.set(row.key, row);

        return row;
    }

    private _cacheRows() {
        this._rows.forEach((row) => this._rowCache.set(row.key, row));
    }

    // COLUMNS

    getColumnData(colIndex: number) {
        return this._columns[colIndex];
    }

    // CELLS

    getCell(rowIndex: number, colIndex: number) {
        const row = this._rows[rowIndex];
        const col = this._columns[colIndex];
        return row.cells[col.key];
    }

    private _createCell(
        key: string,
        { label, value }: SpreadsheetCellData,
    ): MutableSpreadsheetCellData {
        return {
            key,
            label: label ?? value,
            value,
            selected: false,
        };
    }

    // CELL SELECTION

    toggleCellSelection(
        rowIndex: number,
        colIndex: number,
        selected: boolean = true,
    ) {
        const cell = this.getCell(rowIndex, colIndex);
        if (!cell.selected && selected) {
            cell.selected = true;
            this._selectedCellCount++;
        } else if (cell.selected && !selected) {
            cell.selected = false;
            this._selectedCellCount--;
        }
    }

    // CELL EDITING

    isEditable(rowIndex: number, colIndex: number) {
        const cell = this.getCell(rowIndex, colIndex);
        return this.editableCell?.key === cell.key;
    }

    editCell(
        rowIndex: number,
        colIndex: number,
        value: number | string | null,
    ) {
        const row = this._rows[rowIndex];
        const col = this._columns[colIndex];
        if (!row || !col) return null;

        const cell = row.cells[col.key];
        this._setCellValue(cell, col, value);

        if (this._onEditCell) this._onEditCell(row);

        return cell;
    }

    restoreCellValue(
        rowIndex: number,
        colIndex: number,
        cell: MutableSpreadsheetCellData,
    ) {
        const row = this._rows[rowIndex];
        const col = this._columns[colIndex];
        if (!row || !col) return;

        const oldValue = cell.oldValue ?? "";
        this._setCellValue(cell, col, oldValue);

        if (this._onEditCell) this._onEditCell(row);
    }

    private _setCellValue(
        cell: MutableSpreadsheetCellData,
        col: SpreadsheetColumnData,
        value: number | string | null,
    ) {
        value = String(value ?? "");
        cell.value = value;

        // the label is what actually gets rendered when the cell is read-only,
        // so it needs to be update for all field types
        if (col.type == FieldType.TEXT) cell.label = value;
        else if (col.type == FieldType.SELECT && col.options) {
            // TODO: cache this
            const option = col.options.filter((o) => o.value == value)[0];
            cell.label = option.label;
        }
    }

    toggleCellEditMode(rowIndex: number, colIndex: number, editable: boolean) {
        const row = this._rows[rowIndex];
        const col = this._columns[colIndex];
        if (!row || !col) return;

        const cell = row.cells[col.key];

        if (!cell.editable && editable) {
            this._editableCell = cell;
            this._editableCellField = createRef();
            cell.oldValue = row.cells[col.key].value;
            cell.position = { row: rowIndex, col: colIndex };
            cell.editable = true;
        } else if (cell.editable && !editable) {
            this._editableCell = null;
            this._editableCellField = null;
            delete cell.oldValue;
            cell.editable = false;
        }
    }
}

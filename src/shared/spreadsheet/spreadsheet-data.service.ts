import { makeAutoObservable } from "mobx";
import { RefObject, createRef } from "react";

import { FieldType } from "@/constants";
import {
    SpreadsheetCellData,
    SpreadsheetColumnData,
    SpreadsheetRowData,
} from "@/interface";
import {
    MutableSpreadsheetCellData,
    MutableSpreadsheetRowData,
} from "./spreadsheet.model";

type PrivateKeys =
    | "_selectedCellCount"
    | "_onAddRow"
    | "_onDeleteRow"
    | "_onEditCell";

export type AddRowHandler = () => void;
export type DeleteRowHandler = (rowKey: string) => void;
export type EditCellHandler = (
    rowKey: string,
    colKey: string,
    value: number | string | null,
) => void;

interface SpreadsheetDataServiceArguments {
    onAddRow?: AddRowHandler;
    onDeleteRow?: DeleteRowHandler;
    onEditCell?: EditCellHandler;
}

export class SpreadsheetDataService {
    private _rows: MutableSpreadsheetRowData[];
    private _columns: SpreadsheetColumnData[];

    private _selectedCellCount: number = 0;

    private _editableCell: MutableSpreadsheetCellData | null = null;
    private _editableCellField: RefObject<HTMLInputElement> | null = null;

    private _onAddRow?: AddRowHandler;
    private _onDeleteRow?: DeleteRowHandler;
    private _onEditCell?: EditCellHandler;

    constructor({
        onAddRow,
        onDeleteRow,
        onEditCell,
    }: SpreadsheetDataServiceArguments) {
        this._rows = [];
        this._columns = [];

        this._onAddRow = onAddRow;
        this._onDeleteRow = onDeleteRow;
        this._onEditCell = onEditCell;

        makeAutoObservable<SpreadsheetDataService, PrivateKeys>(this, {
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
        rowData: SpreadsheetRowData[],
        columnData: SpreadsheetColumnData[],
    ) {
        this._rows = rowData.map((row) => this._createRow(row));
        this._columns = columnData;
        this._editableCell = null;
    }

    // ROWS

    addRow(rowData: SpreadsheetRowData) {
        const row = this._createRow(rowData);
        this._rows.push(row);
        if (this._onAddRow) this._onAddRow();
    }

    deleteRow(rowKey: string) {
        const idx = this._rows.findIndex((r) => r.key === rowKey);
        if (idx >= 0) {
            this._rows.splice(idx, 1);
            if (this._onDeleteRow) this._onDeleteRow(rowKey);
        }
    }

    highlightRow(rowKey: string) {
        const row = this._rows.find((r) => r.key === rowKey);
        if (row) {
            row.highlighted = true;
        }
    }

    unhighlightRow(rowKey: string) {
        const row = this._rows.find((r) => r.key === rowKey);
        if (row) row.highlighted = false;
    }

    private _createRow({
        key,
        cells,
    }: SpreadsheetRowData): MutableSpreadsheetRowData {
        const mutableCells: { [colKey: string]: MutableSpreadsheetCellData } =
            {};
        for (const [colKey, cell] of Object.entries(cells)) {
            const cellKey = `${key}-${colKey}`;
            mutableCells[colKey] = this._createCell(cellKey, cell);
        }
        return {
            key,
            cells: mutableCells,
            highlighted: false,
        };
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

        if (this._onEditCell) this._onEditCell(row.key, col.key, value);

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

        if (this._onEditCell) this._onEditCell(row.key, col.key, oldValue);
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

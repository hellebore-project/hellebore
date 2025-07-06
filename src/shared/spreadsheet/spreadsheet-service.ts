import { makeAutoObservable, toJS } from "mobx";
import { createRef, RefObject, useEffect } from "react";

import {
    SpreadsheetRowData,
    SpreadsheetColumnData,
    Point,
    FieldType,
} from "@/interface";

type PrivateKeys =
    | "_editableCellPosition"
    | "_onEditCell"
    | "_onAddRow"
    | "_onDeleteRow";

type EditCellHandler = (
    rowIndex: number,
    colKey: string,
    value: number | string | null,
) => void;
type AddRowHandler = () => void;
type DeleteRowHandler = (rowKey: string) => void;

interface SpreadsheetServiceArguments {
    onEditCell?: EditCellHandler;
    onAddRow?: AddRowHandler;
    onDeleteRow?: DeleteRowHandler;
}

export class SpreadsheetService {
    private _rowData: SpreadsheetRowData[];
    private _columnData: SpreadsheetColumnData[];

    private _editableCellPosition: Point | null = null;
    private _editableCellField: RefObject<HTMLInputElement> | null = null;

    private _onAddRow?: AddRowHandler;
    private _onDeleteRow?: DeleteRowHandler;
    private _onEditCell?: EditCellHandler;

    constructor({
        onEditCell,
        onAddRow,
        onDeleteRow,
    }: SpreadsheetServiceArguments) {
        makeAutoObservable<SpreadsheetService, PrivateKeys>(this, {
            _editableCellPosition: false,
            _onEditCell: false,
            _onAddRow: false,
            _onDeleteRow: false,
        });

        this._rowData = [];
        this._columnData = [];

        this._onEditCell = onEditCell;
        this._onAddRow = onAddRow;
        this._onDeleteRow = onDeleteRow;
    }

    get rowData() {
        return toJS(this._rowData);
    }

    get columnData() {
        return toJS(this._columnData);
    }

    get editableCellField() {
        return this._editableCellField;
    }

    initialize(
        rowData: SpreadsheetRowData[],
        columnData: SpreadsheetColumnData[],
    ) {
        this._rowData = rowData;
        this._columnData = columnData;
    }

    addRow(row: SpreadsheetRowData) {
        this._rowData.push(row);
        if (this._onAddRow) this._onAddRow();
    }

    deleteRow(rowKey: string) {
        const idx = this._rowData.findIndex((r) => r.key === rowKey);
        if (idx >= 0) {
            this._rowData.splice(idx, 1);
            if (this._onDeleteRow) this._onDeleteRow(rowKey);
        }
    }

    highlightRow(rowKey: string) {
        const row = this._rowData.find((r) => r.key === rowKey);
        if (row) {
            row.highlighted = true;
        }
    }

    unhighlightRow(rowKey: string) {
        const row = this._rowData.find((r) => r.key === rowKey);
        if (row) row.highlighted = false;
    }

    getCellData(rowIndex: number, colIndex: number) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        return row.cells[col.key];
    }

    editCell(
        rowIndex: number,
        colIndex: number,
        value: number | string | null,
    ) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        if (!row || !col) return;
        row.cells[col.key].value = String(value ?? "");
        if (this._onEditCell) this._onEditCell(rowIndex, col.key, value);
    }

    toggleCellEditMode(rowIndex: number, colIndex: number, editable: boolean) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        if (!row || !col) return;

        if (editable) {
            this._editableCellPosition = { x: rowIndex, y: colIndex };
            this._editableCellField = createRef();
        } else {
            this._editableCellPosition = null;
            this._editableCellField = null;
        }

        row.cells[col.key].editable = editable;
    }

    selectCell(rowIndex: number, colKey: string) {
        // Deselect all cells first
        this._rowData.forEach((row, i) => {
            Object.keys(row.cells).forEach((k) => {
                row.cells[k].selected = i === rowIndex && k === colKey;
                if (!row.cells[k].selected) row.cells[k].editable = false;
            });
        });
    }

    // HOOKS

    hookEditableCellEffect() {
        const ref = this.editableCellField;
        useEffect(() => {
            if (ref?.current) {
                if (document.activeElement === ref.current) return;

                // focus the cell field once it has been added to the DOM
                ref.current.focus();

                if (this._editableCellPosition) {
                    const col = this._columnData[this._editableCellPosition.y];
                    if (col.type == FieldType.SELECT)
                        // expand the dropdown
                        ref.current.click();
                }
            }
        }, [ref]);
    }
}

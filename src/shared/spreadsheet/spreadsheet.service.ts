import { makeAutoObservable, toJS } from "mobx";
import { createRef, RefObject, useEffect } from "react";

import {
    SpreadsheetRowData,
    SpreadsheetColumnData,
    FieldType,
    SpreadsheetSelection,
    SpreadsheetCellData,
} from "@/interface";
import { OutsideEventHandlerService } from "@/shared/outside-event-handler";
import { isFullyContained } from "@/utils/math-utils";

type PrivateKeys =
    | "_sheet"
    | "_editableCellData"
    | "_onEditCell"
    | "_onAddRow"
    | "_onDeleteRow";

type EditCellHandler = (
    rowKey: string,
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

    private _sheet: RefObject<HTMLDivElement>;
    outsideEventHandler: OutsideEventHandlerService;

    private _selection: SpreadsheetSelection | null = null;

    private _editableCellData: SpreadsheetCellData | null = null;
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
            _sheet: false,
            outsideEventHandler: false,
            _editableCellData: false,
            _onEditCell: false,
            _onAddRow: false,
            _onDeleteRow: false,
        });

        this._rowData = [];
        this._columnData = [];

        this._sheet = createRef();

        this._onEditCell = onEditCell;
        this._onAddRow = onAddRow;
        this._onDeleteRow = onDeleteRow;

        this.outsideEventHandler = new OutsideEventHandlerService({
            onOutsideEvent: () => this.clearSelection(),
            node: this._sheet,
            enabled: true,
        });
    }

    get rowCount() {
        return this.rowData.length;
    }

    get rowData() {
        return toJS(this._rowData);
    }

    get columnCount() {
        return this.columnData.length;
    }

    get columnData() {
        return toJS(this._columnData);
    }

    get selection() {
        return this._selection;
    }

    get editableCellField() {
        return this._editableCellField;
    }

    get sheet() {
        return this._sheet;
    }

    // STATE MANAGEMENT

    initialize(
        rowData: SpreadsheetRowData[],
        columnData: SpreadsheetColumnData[],
    ) {
        this._rowData = rowData;
        this._columnData = columnData;
        this._selection = null;
        this._editableCellData = null;
    }

    // ROWS

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

    // COLUMNS

    getColumnData(colIndex: number) {
        return this._columnData[colIndex];
    }

    // CELLS

    getCell(rowIndex: number, colIndex: number) {
        if (!this.sheet.current) return null;

        const table = this.sheet.current.children[0];
        const body = table.children[2];
        const row = body.children[rowIndex];
        return row.children[colIndex];
    }

    getCellData(rowIndex: number, colIndex: number) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        return row.cells[col.key];
    }

    // CELL SELECTION

    selectCell(rowIndex: number, colIndex: number) {
        this.clearSelection();

        this._selection = { row1: rowIndex, col1: colIndex };

        const cellData = this.getCellData(rowIndex, colIndex);
        cellData.selected = true;

        this._scrollCellIntoView(rowIndex, colIndex);

        return cellData;
    }

    clearSelection() {
        if (!this._selection) return;

        const { row1, col1 } = this._selection;
        this._selection = null;

        const cell = this.getCellData(row1, col1);

        cell.selected = false;
        cell.editable = false;

        return cell;
    }

    moveSelection(rowChange: number, colChange: number) {
        if (!this.selection) return;

        const { row1, col1 } = this.selection;

        const i = Math.max(0, Math.min(this.rowCount - 1, row1 + rowChange));
        const j = Math.max(0, Math.min(this.columnCount - 1, col1 + colChange));

        if (row1 + rowChange < 0) this._scrollToTop();

        this.selectCell(i, j);

        this.focus();
    }

    // CELL EDITING

    editCell(
        rowIndex: number,
        colIndex: number,
        value: number | string | null,
    ) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        if (!row || !col) return;

        const cell = row.cells[col.key];

        cell.value = String(value ?? "");

        if (col.type == FieldType.SELECT && col.options) {
            // TODO: cache this
            const option = col.options.filter((o) => o.value == value)[0];
            cell.label = option.label;
        }

        if (this._onEditCell) this._onEditCell(row.key, col.key, value);

        if (cell.finalEdit) this.finalizeCellEditing(rowIndex, colIndex);
    }

    private _restoreCellValue(
        rowIndex: number,
        colIndex: number,
        cell: SpreadsheetCellData,
    ) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        if (!row || !col) return;

        const oldValue = cell.oldValue ?? "";
        cell.value = oldValue;
        if (this._onEditCell) this._onEditCell(row.key, col.key, oldValue);
    }

    toggleCellEditMode(rowIndex: number, colIndex: number, editable: boolean) {
        const row = this._rowData[rowIndex];
        const col = this._columnData[colIndex];
        if (!row || !col) return;

        const cell = row.cells[col.key];

        if (editable) {
            this._editableCellData = cell;
            this._editableCellField = createRef();
            cell.oldValue = row.cells[col.key].value;
            cell.position = { row: rowIndex, col: colIndex };
        } else {
            this._editableCellData = null;
            this._editableCellField = null;
            delete cell.oldValue;
            delete cell.finalEdit;
        }

        cell.editable = editable;
    }

    finalizeCellEditing(rowIndex: number, colIndex: number) {
        this.toggleCellEditMode(rowIndex, colIndex, false);
        this.moveSelection(1, 0); // move selection down by 1 row
    }

    // FOCUS

    focus() {
        if (this._sheet?.current) {
            this._sheet.current.focus();
        }
    }

    // SCROLLING

    private _scrollCellIntoView(rowIndex: number, colIndex: number) {
        const cell = this.getCell(rowIndex, colIndex);
        if (cell && this.sheet.current) {
            const cellRect = cell.getBoundingClientRect();
            const sheetRect = this.sheet.current.getBoundingClientRect();

            if (!isFullyContained(cellRect, sheetRect)) {
                cell.scrollIntoView({
                    behavior: "instant",
                    block: "nearest",
                    inline: "nearest",
                });
            }
        }
    }

    private _scrollToTop() {
        if (this.sheet.current) this.sheet.current.scrollTop = 0;
    }

    // KEYBOARD

    handleKeyDown(event: React.KeyboardEvent) {
        const propagate = this._handleKeyDown(event);
        if (!propagate) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _handleKeyDown(event: React.KeyboardEvent) {
        if (!this._selection) return true;

        const { row1: rowIndex, col1: colIndex } = this._selection;
        const cell = this.getCellData(rowIndex, colIndex);

        if (cell.editable)
            return this._handleKeyDownForEditableCell(
                event,
                cell,
                rowIndex,
                colIndex,
            );
        else
            return this._handleKeyDownForReadOnlyCell(
                event,
                rowIndex,
                colIndex,
            );
    }

    private _handleKeyDownForReadOnlyCell(
        event: React.KeyboardEvent,
        rowIndex: number,
        colIndex: number,
    ) {
        if (event.key === "Enter") {
            this.toggleCellEditMode(rowIndex, colIndex, true);
            // Do NOT change focus to spreadsheet container
            return false;
        } else if (event.key === "ArrowDown") {
            this.moveSelection(1, 0);
            return false;
        } else if (event.key === "ArrowUp") {
            this.moveSelection(-1, 0);
            return false;
        } else if (event.key === "ArrowLeft") {
            this.moveSelection(0, -1);
            return false;
        } else if (event.key === "ArrowRight") {
            this.moveSelection(0, 1);
            return false;
        }

        return true;
    }

    private _handleKeyDownForEditableCell(
        event: React.KeyboardEvent,
        cell: SpreadsheetCellData,
        rowIndex: number,
        colIndex: number,
    ) {
        const col = this.getColumnData(colIndex);

        if (event.key === "Enter") {
            this.finalizeCellEditing(rowIndex, colIndex);
            return false;
        } else if (event.key === "Escape") {
            if (col.type == FieldType.TEXT)
                // Restore original value
                this._restoreCellValue(rowIndex, colIndex, cell);
            this.toggleCellEditMode(rowIndex, colIndex, false);
            // Focus spreadsheet container after edit
            this.focus();

            return false;
        } else if (event.key === "ArrowDown") {
            if (col.type == FieldType.SELECT)
                // don't handle when a select field is being edited
                return true;

            this.moveSelection(1, 0);

            return false;
        } else if (event.key === "ArrowUp") {
            if (col.type == FieldType.SELECT)
                // don't handle when a select field is being edited
                return true;

            this.moveSelection(-1, 0);

            return false;
        } else if (event.key === "ArrowLeft") {
            if (col.type == FieldType.TEXT)
                // don't handle when a text field is being edited
                return true;

            this.moveSelection(0, -1);

            return false;
        } else if (event.key === "ArrowRight") {
            if (col.type == FieldType.TEXT)
                // don't handle when a text field is being edited
                return true;

            this.moveSelection(0, 1);

            return false;
        }

        return true;
    }

    // HOOKS

    hookEditableCellEffect() {
        const ref = this.editableCellField;
        useEffect(() => {
            if (ref?.current) {
                if (document.activeElement === ref.current) return;

                // focus the cell field once it has been added to the DOM
                ref.current.focus();

                if (this._editableCellData && this._editableCellData.position) {
                    const col =
                        this._columnData[this._editableCellData.position.col];
                    if (col.type == FieldType.SELECT)
                        // expand the dropdown
                        ref.current.click();
                }
            }
        }, [ref]);
    }
}

import { makeAutoObservable } from "mobx";
import { createRef, MouseEvent, RefObject, useEffect } from "react";

import { FieldType } from "@/constants";
import { SpreadsheetRowData, SpreadsheetColumnData } from "@/interface";
import { OutsideEventHandlerService } from "@/shared/outside-event-handler";
import { isFullyContained } from "@/utils/math-utils";
import { SpreadsheetSelectionService } from "./spreadsheet-selection.service";
import { MutableSpreadsheetCellData } from "./spreadsheet.model";
import {
    AddRowHandler,
    DeleteRowHandler,
    EditCellHandler,
    SpreadsheetDataService,
} from "./spreadsheet-data.service";

type PrivateKeys = "_sheet" | "_editableCell";

interface SpreadsheetServiceArguments {
    onAddRow?: AddRowHandler;
    onDeleteRow?: DeleteRowHandler;
    onEditCell?: EditCellHandler;
}

export class SpreadsheetService {
    private _sheet: RefObject<HTMLDivElement>;

    outsideEvent: OutsideEventHandlerService;
    data: SpreadsheetDataService;
    selection: SpreadsheetSelectionService;

    constructor({
        onAddRow,
        onDeleteRow,
        onEditCell,
    }: SpreadsheetServiceArguments) {
        makeAutoObservable<SpreadsheetService, PrivateKeys>(this, {
            _sheet: false,
            _editableCell: false,
            outsideEvent: false,
            data: false,
            selection: false,
        });

        this._sheet = createRef();

        this.outsideEvent = new OutsideEventHandlerService({
            onOutsideEvent: () => this.selection.clear(),
            node: this._sheet,
            enabled: true,
        });
        this.data = new SpreadsheetDataService({
            onAddRow,
            onDeleteRow,
            onEditCell,
        });
        this.selection = new SpreadsheetSelectionService(this.data);
    }

    get sheet() {
        return this._sheet;
    }

    // STATE MANAGEMENT

    initialize(
        rowData: SpreadsheetRowData[],
        columnData: SpreadsheetColumnData[],
    ) {
        this.selection.clear();
        this.data.initialize(rowData, columnData);
    }

    // CELLS

    private _getCellDomElement(rowIndex: number, colIndex: number) {
        if (!this.sheet.current) return null;

        const table = this.sheet.current.children[0];
        const body = table.children[2];
        const row = body.children[rowIndex];
        return row.children[colIndex];
    }

    // CELL SELECTION

    private _translateActiveSelection(rowChange: number, colChange: number) {
        const result = this.selection.translate(rowChange, colChange);
        if (!result) return;

        if (result.overflowTop) this._scrollToTop();
        else this._scrollCellIntoView(result.position.row, result.position.col);

        this._focus();
    }

    // FOCUS

    private _focus() {
        if (this._sheet?.current) {
            this._sheet.current.focus();
        }
    }

    // SCROLLING

    private _scrollCellIntoView(rowIndex: number, colIndex: number) {
        const cell = this._getCellDomElement(rowIndex, colIndex);
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

    // MOUSE

    onCellMouseDown(event: MouseEvent, rowIndex: number, colIndex: number) {
        let propagate = false;

        if (event.shiftKey) {
            const start = this.selection.activePosition;
            if (start) this.selection.resize(rowIndex, colIndex);
            else this.selection.select(rowIndex, colIndex);
        } else if (event.ctrlKey) {
            this.selection.commitActiveSelection();
            this.selection.toggle(rowIndex, colIndex);
        } else {
            const cell = this.data.getCell(rowIndex, colIndex);
            // retrieve the selected status BEFORE selecting the cell,
            // otherwise an unselected cell will become editable immediately upon selection
            const selected = cell.selected;
            if (cell.editable) propagate = true;
            else {
                this.selection.reduceToSingleCell(rowIndex, colIndex);
                if (selected)
                    this.data.toggleCellEditMode(rowIndex, colIndex, true);
            }
        }

        if (!propagate) {
            const element = event.currentTarget as HTMLElement;
            element.focus();

            event.preventDefault();
            event.stopPropagation();
        }
    }

    onCellMouseEnter(event: MouseEvent, rowIndex: number, colIndex: number) {
        // primary button is typically the left mouse button;
        // `event.buttons` uses a single integer to encode which mouse buttons are currently being pressed;
        // refer to https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
        const isPrimaryButtonPressed = Boolean(event.buttons & (1 << 0));
        if (isPrimaryButtonPressed) this.selection.resize(rowIndex, colIndex);
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
        if (!this.selection.activePosition) return true;

        const activePosition = this.selection.activePosition;
        const cell = this.data.getCell(activePosition.row, activePosition.col);

        if (cell.editable)
            return this._handleKeyDownForEditableCell(
                event,
                cell,
                activePosition.row,
                activePosition.col,
            );
        else
            return this._handleKeyDownForReadOnlyCell(
                event,
                activePosition.row,
                activePosition.col,
            );
    }

    private _handleKeyDownForReadOnlyCell(
        event: React.KeyboardEvent,
        rowIndex: number,
        colIndex: number,
    ) {
        if (event.key === "Enter") {
            this.selection.reduceToSingleCell(rowIndex, colIndex);
            this.data.toggleCellEditMode(rowIndex, colIndex, true);
            // Do NOT change focus to spreadsheet container
            return false;
        } else if (event.key === "ArrowDown") {
            this._translateActiveSelection(1, 0);
            return false;
        } else if (event.key === "ArrowUp") {
            this._translateActiveSelection(-1, 0);
            return false;
        } else if (event.key === "ArrowLeft") {
            this._translateActiveSelection(0, -1);
            return false;
        } else if (event.key === "ArrowRight") {
            this._translateActiveSelection(0, 1);
            return false;
        }

        return true;
    }

    private _handleKeyDownForEditableCell(
        event: React.KeyboardEvent,
        cell: MutableSpreadsheetCellData,
        rowIndex: number,
        colIndex: number,
    ) {
        const col = this.data.getColumnData(colIndex);

        if (event.key === "Enter") {
            this.data.toggleCellEditMode(rowIndex, colIndex, false);
            this._translateActiveSelection(1, 0); // move selection down by 1 row
            return false;
        } else if (event.key === "Escape") {
            if (col.type == FieldType.TEXT)
                // Restore original value
                this.data.restoreCellValue(rowIndex, colIndex, cell);
            this.data.toggleCellEditMode(rowIndex, colIndex, false);
            // Focus spreadsheet container after edit
            this._focus();

            return false;
        } else if (event.key === "ArrowDown") {
            if (col.type == FieldType.SELECT)
                // don't handle when a select field is being edited
                return true;

            this._translateActiveSelection(1, 0);

            return false;
        } else if (event.key === "ArrowUp") {
            if (col.type == FieldType.SELECT)
                // don't handle when a select field is being edited
                return true;

            this._translateActiveSelection(-1, 0);

            return false;
        } else if (event.key === "ArrowLeft") {
            if (col.type == FieldType.TEXT)
                // don't handle when a text field is being edited
                return true;

            this._translateActiveSelection(0, -1);

            return false;
        } else if (event.key === "ArrowRight") {
            if (col.type == FieldType.TEXT)
                // don't handle when a text field is being edited
                return true;

            this._translateActiveSelection(0, 1);

            return false;
        }

        return true;
    }

    // HOOKS

    hookEditableCellEffect() {
        const ref = this.data.editableCellElement;
        useEffect(() => {
            if (ref?.current) {
                if (document.activeElement === ref.current) return;

                // focus the cell field once it has been added to the DOM
                // so that the user can immediately start editing it
                ref.current.focus();

                if (this.data.editableCellFieldType === FieldType.SELECT)
                    ref.current.click(); // expand the dropdown
            }
        }, [ref]);
    }
}

import { makeAutoObservable } from "mobx";
import { createRef, MouseEvent, RefObject, useEffect } from "react";

import { OutsideEventHandlerService } from "@/shared/outside-event-handler";
import { isFullyContained } from "@/utils/math-utils";

import {
    SpreadsheetCellData,
    SpreadsheetColumnData,
    SpreadsheetFieldType,
    SpreadsheetRowData,
} from "./spreadsheet.interface";
import {
    SpreadsheetDataService,
    SpreadsheetDataServiceArguments,
} from "./spreadsheet-data.service";
import { SpreadsheetSelectionService } from "./spreadsheet-selection.service";

type PrivateKeys = "_sheetRef";

export interface SpreadsheetServiceArguments<K extends string, M> {
    data: SpreadsheetDataServiceArguments<K, M>;
}

export class SpreadsheetService<K extends string, M> {
    /** Reference to the parent of the the table element; set at render-time by the outside-event handler. */
    private _sheetRef: RefObject<HTMLDivElement>;

    outsideEvent: OutsideEventHandlerService;
    data: SpreadsheetDataService<K, M>;
    selection: SpreadsheetSelectionService<K, M>;

    constructor({ data }: SpreadsheetServiceArguments<K, M>) {
        this._sheetRef = createRef();

        this.outsideEvent = new OutsideEventHandlerService({
            enabled: true,
            ref: this._sheetRef,
            onOutsideEvent: () => this.selection.clear(),
        });
        this.data = new SpreadsheetDataService(data);
        this.selection = new SpreadsheetSelectionService(this.data);

        makeAutoObservable<SpreadsheetService<K, M>, PrivateKeys>(this, {
            // NOTE: making the sheet reference observable prevents
            // it from getting set by outside-event handler
            _sheetRef: false,
            outsideEvent: false,
            data: false,
            selection: false,
        });
    }

    get sheetRef() {
        return this._sheetRef;
    }

    // STATE MANAGEMENT

    initialize(
        rowData: SpreadsheetRowData<K, M>[],
        columnData: SpreadsheetColumnData<K>[],
    ) {
        this.selection.clear();
        this.data.initialize(rowData, columnData);
    }

    // CELLS

    private _getCellDomElement(rowIndex: number, colIndex: number) {
        if (!this.sheetRef.current) return null;

        const table = this.sheetRef.current.children[0];
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
        console.log(this.sheetRef.current);
        if (!this.sheetRef.current) return;
        this.sheetRef.current.focus();
    }

    // SCROLLING

    private _scrollCellIntoView(rowIndex: number, colIndex: number) {
        const cell = this._getCellDomElement(rowIndex, colIndex);
        if (cell && this.sheetRef.current) {
            const cellRect = cell.getBoundingClientRect();
            const sheetRect = this.sheetRef.current.getBoundingClientRect();

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
        if (this.sheetRef.current) this.sheetRef.current.scrollTop = 0;
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
        console.log(`key press ${event.key}`);
        console.log(this._sheetRef.current);
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
        cell: SpreadsheetCellData,
        rowIndex: number,
        colIndex: number,
    ) {
        const col = this.data.getColumnData(colIndex);

        if (event.key === "Enter") {
            this.data.toggleCellEditMode(rowIndex, colIndex, false);
            this._translateActiveSelection(1, 0); // move selection down by 1 row
            return false;
        } else if (event.key === "Escape") {
            if (col.type == SpreadsheetFieldType.TEXT)
                // Restore original value
                this.data.restoreCellValue(rowIndex, colIndex, cell);
            this.data.toggleCellEditMode(rowIndex, colIndex, false);
            // Focus spreadsheet container after edit
            this._focus();

            return false;
        } else if (event.key === "ArrowDown") {
            if (col.type == SpreadsheetFieldType.SELECT)
                // don't handle when a select field is being edited
                return true;

            this._translateActiveSelection(1, 0);

            return false;
        } else if (event.key === "ArrowUp") {
            if (col.type == SpreadsheetFieldType.SELECT)
                // don't handle when a select field is being edited
                return true;

            this._translateActiveSelection(-1, 0);

            return false;
        } else if (event.key === "ArrowLeft") {
            if (col.type == SpreadsheetFieldType.TEXT)
                // don't handle when a text field is being edited
                return true;

            this._translateActiveSelection(0, -1);

            return false;
        } else if (event.key === "ArrowRight") {
            if (col.type == SpreadsheetFieldType.TEXT)
                // don't handle when a text field is being edited
                return true;

            this._translateActiveSelection(0, 1);

            return false;
        }

        return true;
    }

    // HOOKS

    hook() {
        const ref = this.data.editableCellRef;
        useEffect(() => {
            if (ref?.current) {
                if (document.activeElement === ref.current) return;

                // focus the cell field once it has been added to the DOM
                // so that the user can immediately start editing it
                ref.current.focus();

                if (
                    this.data.editableCellFieldType ===
                    SpreadsheetFieldType.SELECT
                )
                    ref.current.click(); // expand the dropdown
            }
        }, [ref]);

        this.outsideEvent.hook();
    }
}

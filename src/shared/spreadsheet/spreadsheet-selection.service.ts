import { makeAutoObservable } from "mobx";

import {
    parsePositionKey,
    SpreadsheetSelectedRectangle,
} from "./spreadsheet.model";
import { SpreadsheetDataService } from "./spreadsheet-data.service";
import { PositionKey, SpreadsheetCellPosition } from "./spreadsheet.interface";

type PrivateKeys =
    | "_baseSelection"
    | "_activeSelection"
    | "_positiveDiff"
    | "_negativeDiff"
    | "_data";

export interface TranslateSelectionResult {
    position: SpreadsheetCellPosition;
    overflowTop: boolean;
}

export interface UpdateSelectionArguments {
    start: SpreadsheetCellPosition;
    end: SpreadsheetCellPosition;
    positive?: boolean;
}

export class SpreadsheetSelectionService<K extends string, M> {
    private _baseSelection: Set<PositionKey>;
    private _activePosition: SpreadsheetCellPosition | null = null;
    private _activeSelection: SpreadsheetSelectedRectangle | null = null;
    private _positiveDiff: Set<PositionKey>;
    private _negativeDiff: Set<PositionKey>;

    private _data: SpreadsheetDataService<K, M>;

    constructor(data: SpreadsheetDataService<K, M>) {
        makeAutoObservable<SpreadsheetSelectionService<K, M>, PrivateKeys>(
            this,
            {
                _baseSelection: false,
                _activeSelection: false,
                _positiveDiff: false,
                _negativeDiff: false,
                _data: false,
            },
        );

        this._baseSelection = new Set();
        this._positiveDiff = new Set();
        this._negativeDiff = new Set();

        this._data = data;
    }

    get activePosition() {
        return this._activePosition;
    }

    get isActiveCellSelected() {
        if (!this._activePosition) return false;
        return this.isSelected(
            this._activePosition.row,
            this._activePosition.col,
        );
    }

    get activeSelection() {
        return this._activeSelection;
    }

    isEmpty() {
        return this._data.selectedCellCount == 0;
    }

    isActive(row: number, col: number) {
        return (
            this._activePosition &&
            this._activePosition.row === row &&
            this._activePosition.col === col
        );
    }

    isSelected(row: number, col: number) {
        return this._data.getCell(row, col).selected ?? false;
    }

    // UPDATE

    select(row: number, col: number) {
        const pos = { row, col };
        this._activePosition = pos;
        this._updateActiveSelection({ start: pos, end: pos, positive: true });
        this._applyDiffs();
    }

    toggle(row: number, col: number) {
        const selected = this.isSelected(row, col);
        const pos = { row, col };
        this._activePosition = pos;
        this._updateActiveSelection({
            start: pos,
            end: pos,
            positive: !selected,
        });
        this._applyDiffs();
    }

    resize(row: number, col: number) {
        if (!this._activeSelection || !this._activePosition) return;
        const selected = this.isActiveCellSelected;
        const start = this._activePosition;
        const end = { row, col };
        this._updateActiveSelection({ start, end, positive: selected });
        this._applyDiffs();
    }

    translate(
        rowChange: number,
        colChange: number,
    ): TranslateSelectionResult | null {
        if (!this._activePosition) return null;
        this._clearSelection();

        const { row: j0, col: i0 } = this._activePosition;

        const j = Math.max(
            0,
            Math.min(this._data.rowCount - 1, j0 + rowChange),
        );
        const i = Math.max(
            0,
            Math.min(this._data.columnCount - 1, i0 + colChange),
        );

        const pos = { row: j, col: i };
        this._updateActiveSelection({ start: pos, end: pos, positive: true });

        this._applyDiffs();
        this._activePosition = pos;

        return {
            position: { row: j, col: i },
            overflowTop: j0 + rowChange < 0,
        };
    }

    reduceToSingleCell(row: number, col: number) {
        this._activePosition = { row, col };
        if (this._data.selectedCellCount == 1 && this.isActiveCellSelected)
            return;

        this._clearSelection();
        this._updateActiveSelection({
            start: this._activePosition,
            end: this._activePosition,
            positive: true,
        });
        this._applyDiffs();
    }

    private _updateActiveSelection({
        start,
        end,
        positive = true,
    }: UpdateSelectionArguments) {
        const oldSelection = this._activeSelection;
        if (oldSelection) {
            const oldKeys = oldSelection.positionKeys;

            // undo the old active selection
            if (oldSelection.positive)
                this._modifyDiffs(
                    oldKeys.difference(this._baseSelection),
                    false,
                );
            else
                this._modifyDiffs(
                    oldKeys.intersection(this._baseSelection),
                    true,
                );
        }

        const newSelection = new SpreadsheetSelectedRectangle(
            start,
            end,
            positive,
        );
        this._modifyDiffs(newSelection.positionKeys, newSelection.positive);

        this._activeSelection = newSelection;
    }

    // COMMIT

    commitActiveSelection() {
        if (!this._activeSelection) return;

        if (this._activeSelection.positive)
            this._baseSelection = this._baseSelection.union(
                this._activeSelection.positionKeys,
            );
        else
            this._baseSelection = this._baseSelection.difference(
                this._activeSelection.positionKeys,
            );

        this._activeSelection = null;
    }

    // CLEAR

    clear() {
        this._activePosition = null;
        this._clearSelection();
        this._applyDiffs();
    }

    _clearSelection() {
        this._clearDiffs();

        this._modifyDiffs(this._baseSelection, false);
        this._baseSelection.clear();

        if (this._activeSelection && this._activeSelection.positive) {
            this._modifyDiffs(this._activeSelection.positionKeys, false);
            this._activeSelection = null;
        }
    }

    // DIFFS

    private _modifyDiffs(keys: Set<PositionKey>, positive: boolean = true) {
        if (positive) {
            this._positiveDiff = this._positiveDiff.union(keys);
            this._negativeDiff = this._negativeDiff.difference(keys);
        } else {
            this._positiveDiff = this._positiveDiff.difference(keys);
            this._negativeDiff = this._negativeDiff.union(keys);
        }
    }

    private _applyDiffs() {
        for (const key of this._positiveDiff) {
            const { row, col } = parsePositionKey(key);
            this._data.toggleCellSelection(row, col, true);
        }

        for (const key of this._negativeDiff) {
            const { row, col } = parsePositionKey(key);
            this._data.toggleCellSelection(row, col, false);
        }

        this._clearDiffs();
    }

    private _clearDiffs() {
        this._positiveDiff.clear();
        this._negativeDiff.clear();
    }
}

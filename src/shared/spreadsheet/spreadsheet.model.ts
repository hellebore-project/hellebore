import { Rectangle } from "@/interface";

import { PositionKey, SpreadsheetCellPosition } from "./spreadsheet.interface";

export function generatePositionKey(row: number, col: number): PositionKey {
    return `${row}-${col}`;
}

export function parsePositionKey(key: PositionKey): SpreadsheetCellPosition {
    const [row, col] = key.split("-", 2);
    return { row: Number(row), col: Number(col) };
}

export class SpreadsheetSelectedRectangle implements Rectangle {
    left = 0;
    right = 0;
    top = 0;
    bottom = 0;
    positive = true;

    constructor(
        start: SpreadsheetCellPosition,
        end?: SpreadsheetCellPosition,
        positive = true,
    ) {
        this.set(start, end ?? start);
        this.positive = positive;
    }

    get negative() {
        return !this.positive;
    }

    get positionKeys() {
        return new Set(this.iteratePositionKeys());
    }

    *iteratePositionKeys() {
        for (let i = this.left; i <= this.right; i++) {
            for (let j = this.top; j <= this.bottom; j++) {
                yield generatePositionKey(j, i);
            }
        }
    }

    set(start: SpreadsheetCellPosition, end: SpreadsheetCellPosition) {
        this.top = Math.min(start.row, end.row);
        this.bottom = Math.max(start.row, end.row);
        this.left = Math.min(start.col, end.col);
        this.right = Math.max(start.col, end.col);
    }

    toString() {
        return `{top: ${this.top}, left: ${this.left}, bottom: ${this.bottom}, right: ${this.right}}`;
    }
}

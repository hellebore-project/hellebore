import {
    Rectangle,
    SpreadsheetCellData,
    SpreadsheetCellPosition,
    SpreadsheetRowData,
} from "@/interface";

export type PositionKey = string;

export function generatePositionKey(row: number, col: number): PositionKey {
    return `${row}-${col}`;
}

export function parsePositionKey(key: PositionKey): SpreadsheetCellPosition {
    const [row, col] = key.split("-", 2);
    return { row: Number(row), col: Number(col) };
}

export interface MutableSpreadsheetCellData extends SpreadsheetCellData {
    key: string;
    label: string;
    value: string;
    oldValue?: string;
    position?: SpreadsheetCellPosition;
    selected: boolean;
    editable?: boolean;
}

export interface MutableSpreadsheetRowData<D> extends SpreadsheetRowData<D> {
    key: string;
    cells: { [key: string]: MutableSpreadsheetCellData };
    highlighted: boolean;
}

export class SpreadsheetSelectedRectangle implements Rectangle {
    left: number = 0;
    right: number = 0;
    top: number = 0;
    bottom: number = 0;
    positive: boolean = true;

    constructor(
        start: SpreadsheetCellPosition,
        end?: SpreadsheetCellPosition,
        positive: boolean = true,
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

export type AddRowHandler = () => void;
export type DeleteRowHandler<D> = (row: MutableSpreadsheetRowData<D>) => void;
export type EditCellHandler<D> = (row: MutableSpreadsheetRowData<D>) => void;

import { OptionData } from "./common";
import { FieldType } from "./field-data";

export interface SpreadsheetCellPosition {
    row: number;
    col: number;
}

export interface SpreadsheetCellData {
    label?: string;
    value: string;
}

export interface SpreadsheetRowData {
    key: string;
    cells: { [key: string]: SpreadsheetCellData };
}

export interface SpreadsheetColumnData {
    key: string;
    type: FieldType;
    label: string;
    defaultValue?: string;
    options?: OptionData[];
}

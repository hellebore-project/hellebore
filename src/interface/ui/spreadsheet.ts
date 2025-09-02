import { FieldType } from "@/constants";
import { OptionData } from "./common";

export interface SpreadsheetCellPosition {
    row: number;
    col: number;
}

export interface SpreadsheetCellData {
    label?: string;
    value: string;
}

export interface SpreadsheetRowData<D> {
    key: string;
    cells: { [key: string]: SpreadsheetCellData };
    data: D;
}

export interface SpreadsheetColumnData {
    key: string;
    type: FieldType;
    label: string;
    defaultValue?: string;
    options?: OptionData[];
}

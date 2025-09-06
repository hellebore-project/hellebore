import { FieldType } from "@/constants";
import { OptionData } from "@/interface";

export type PositionKey = string;

export interface SpreadsheetCellPosition {
    row: number;
    col: number;
}

export interface SpreadsheetCellData {
    key: string;
    label?: string;
    value: string;
    oldValue?: string;
    position?: SpreadsheetCellPosition;
    selected?: boolean;
    editable?: boolean;
}

export interface SpreadsheetRowData<K extends string, M> {
    key: string;
    cells: Record<K, SpreadsheetCellData>;
    metaData: M;
    highlighted?: boolean;
}

export interface SpreadsheetColumnData<K extends string> {
    key: K;
    type: FieldType;
    label: string;
    defaultValue?: string;
    options?: OptionData[];
}

export type AddRowHandler = () => void;
export type DeleteRowHandler<K extends string, M> = (
    row: SpreadsheetRowData<K, M>,
) => void;
export type EditCellHandler<K extends string, M> = (
    row: SpreadsheetRowData<K, M>,
) => void;

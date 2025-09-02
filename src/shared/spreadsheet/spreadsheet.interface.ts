import { FieldType } from "@/constants";
import { OptionData } from "@/interface";

export type PositionKey = string;

export interface SpreadsheetCellPosition {
    row: number;
    col: number;
}

export interface SpreadsheetCellData {
    label?: string;
    value: string;
}

export interface SpreadsheetRowData<K extends string, M> {
    key: string;
    cells: Record<K, SpreadsheetCellData>;
    metaData: M;
}

export interface SpreadsheetColumnData<K extends string> {
    key: K;
    type: FieldType;
    label: string;
    defaultValue?: string;
    options?: OptionData[];
}

// TODO: unify the Mutable* interfaces with their respective parents

export interface MutableSpreadsheetCellData extends SpreadsheetCellData {
    key: string;
    label: string;
    oldValue?: string;
    position?: SpreadsheetCellPosition;
    selected: boolean;
    editable?: boolean;
}

export interface MutableSpreadsheetRowData<K extends string, M>
    extends SpreadsheetRowData<K, M> {
    cells: Record<K, MutableSpreadsheetCellData>;
    highlighted: boolean;
}

export type AddRowHandler = () => void;
export type DeleteRowHandler<K extends string, M> = (
    row: MutableSpreadsheetRowData<K, M>,
) => void;
export type EditCellHandler<K extends string, M> = (
    row: MutableSpreadsheetRowData<K, M>,
) => void;

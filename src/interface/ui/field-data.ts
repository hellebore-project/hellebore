import { SyntheticEvent } from "react";
import { BaseButtonSettings } from "./common";
import { ComboboxItem } from "@mantine/core";

export enum FieldType {
    TEXT,
    SELECT,
}

export type OptionData = ComboboxItem;

export interface SuggestionData {
    label: string;
    value: any;
}

export interface SpreadsheetCellData {
    label?: string;
    value: string;
    selected?: boolean;
    editable?: boolean;
}

export interface SpreadsheetRowData {
    key: string;
    cells: { [key: string]: SpreadsheetCellData };
    highlighted: boolean;
}

export interface SpreadsheetColumnData {
    key: string;
    type: FieldType;
    label: string;
    options?: OptionData[];
}

export interface VerticalSelectionData extends BaseButtonSettings {
    index: number;
    label: string;
    onConfirm?: (e: SyntheticEvent<HTMLButtonElement>) => Promise<any>;
}

export interface FieldData {
    property: string;
    type: FieldType;
    label: string;
    options?: OptionData[];
    getValue?: () => any;
    setValue?: (value: string) => void;
}

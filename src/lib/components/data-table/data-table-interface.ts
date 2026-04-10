import type { Snippet } from "svelte";

import type { DataTableService } from "./data-table-service.svelte";

export type PositionKey = string;

export interface DataCell {
    value: string;
    oldValue?: string;
}

export interface DataRow<TColKey extends string> {
    key: string;
    filterable?: boolean;
    cells: Record<TColKey, DataCell>;
}

export interface TextColumn<TColKey extends string = string> {
    key: TColKey;
    label: string;
    type: "text";
    filterable?: boolean;
    getLabel?: (rowKey: string, value: string) => string;
}

export interface SelectColumnItem {
    label: string;
    value: string;
}

export interface SelectColumn<TColKey extends string = string> {
    key: TColKey;
    label: string;
    type: "select";
    filterable?: boolean;
    items: SelectColumnItem[];
}

export type DataColumn<TColKey extends string = string> =
    | TextColumn<TColKey>
    | SelectColumn<TColKey>;

export interface SelectionAnchor<TColKey extends string = string> {
    rowIndex: number;
    colKey: TColKey;
}

export interface DataTableProps<TColKey extends string = string> {
    service: DataTableService<TColKey> | null;
    rowActions?: Snippet<[string]>;
}

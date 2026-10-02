import type { Snippet } from "svelte";

import type { DataTableService } from "./data-table-service.svelte";
import type { DataType, FilterPredicate, SortOrder } from "@/api";
import type { ChangePageAction } from "@/constants";

// CELL

export type DataCellKeyString = string;

export interface DataCellKey<TColKey> {
    rowKey: string;
    colKey: TColKey;
}

export interface DataCell {
    value: string;
    oldValue?: string;
}

// ROW

export interface DataRow<TColKey extends string, TMetaData = object> {
    key: string;
    filterable?: boolean;
    cells: Record<TColKey, DataCell>;
    metaData: TMetaData;
}

// COLUMN

interface BaseDataColumn<TColKey extends string = string, TMetaData = object> {
    key: TColKey;
    label: string;
    dataType: Exclude<DataType, DataType.None>;
    fieldType: "text" | "select";
    filterable?: boolean;
    metaData: TMetaData;
}

export interface TextColumn<
    TColKey extends string = string,
    TMetaData = object,
> extends BaseDataColumn<TColKey, TMetaData> {
    fieldType: "text";
    getLabel?: (rowKey: string, value: string) => string;
}

export interface SelectColumnItem {
    label: string;
    value: string;
}

export interface SelectColumn<
    TColKey extends string = string,
    TMetaData = object,
> extends BaseDataColumn<TColKey, TMetaData> {
    fieldType: "select";
    items: SelectColumnItem[];
}

export type DataColumn<TColKey extends string = string, TMetaData = object> =
    TextColumn<TColKey, TMetaData> | SelectColumn<TColKey, TMetaData>;

// SELECTION

export interface SelectionAnchor<TColKey extends string = string> {
    rowIndex: number;
    colKey: TColKey;
}

// QUERY

export interface DataTableSortItem<TColKey> {
    colKey: TColKey;
    order: SortOrder;
}

export interface DataTableFilterItem {
    predicate: FilterPredicate<number | string>;
}

export interface DataTableQueryRequest<TColKey extends string> {
    pagination: {
        action: ChangePageAction;
        oldPageIndex: number;
        newPageIndex?: number;
        pageCount?: number | null;
        oldOffset?: number | null;
        limit: number;
    };
    // the sort items have to be stored as a sequence because
    // the order in which each sort is applied matters
    sortation: DataTableSortItem<TColKey>[];
    // each filter item is implicitly evaluated as part of a logical conjunction;
    // i.e., using the AND operator
    filters: Partial<Record<TColKey, DataTableFilterItem>>;
}

export interface DataTableQueryResult<I> {
    items: I[];
    pagination?: {
        pageIndex: number;
        pageCount?: number | null;
        total?: number | null;
        offset?: number | null;
    };
}

// PROPS

export interface TextCellProps {
    value: string;
    oninput: (value: string) => void;
    selectAll?: boolean;
}

export interface SelectCellProps<
    TColKey extends string,
    TRowMetaData = object,
    TColMetaData = object,
> {
    value: string;
    items: SelectColumnItem[];
    service: DataTableService<TColKey, TRowMetaData, TColMetaData>;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export interface DataRowProps<
    TColKey extends string,
    TRowMetaData = object,
    TColMetaData = object,
> {
    row: { key: string; cells: Record<TColKey, { value: string }> };
    service: DataTableService<TColKey, TRowMetaData, TColMetaData>;
    rowActions?: Snippet<[string]>;
}

export interface DataTableProps<
    TColKey extends string = string,
    TRowMetaData = object,
    TColMetaData = object,
> {
    service: DataTableService<TColKey, TRowMetaData, TColMetaData> | null;
    rowActions?: Snippet<[string]>;
    placeholder?: Snippet;
}

// EVENTS

export interface DataCellEvent<TColKey> {
    rowKey: string;
    colKey: TColKey;
}

export interface DataCellEditEvent<TColKey> {
    rowKey: string;
    colKey: TColKey;
    value: string;
}

export interface DataTableQueryEvent {
    pageAction?: ChangePageAction;
    oldPageIndex?: number | null;
    newPageIndex?: number | null;
}

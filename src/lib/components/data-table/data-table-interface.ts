import type { Snippet } from "svelte";

import type { DataTableService } from "./data-table-service.svelte";
import type { DataType, FilterPredicate, SortOrder } from "@/api";
import type { ChangePageAction } from "@/constants";

export type PositionKey = string;

// CELL

export interface DataCellKey<TColKey> {
    rowKey: string;
    colKey: TColKey;
}

export interface DataCell {
    value: string;
    oldValue?: string;
}

// ROW

export interface DataRow<TColKey extends string> {
    key: string;
    filterable?: boolean;
    cells: Record<TColKey, DataCell>;
}

// COLUMN

interface BaseColumn<TColKey extends string = string, TMetaData = object> {
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
> extends BaseColumn<TColKey, TMetaData> {
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
> extends BaseColumn<TColKey, TMetaData> {
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
        pageIndex: number;
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
    };
}

// PROPS

export interface TextCellProps {
    value: string;
    oninput: (value: string) => void;
    selectAll?: boolean;
}

export interface SelectCellProps<TColKey extends string, TColMetaData> {
    value: string;
    items: SelectColumnItem[];
    service: DataTableService<TColKey, TColMetaData>;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export interface DataTableProps<
    TColKey extends string = string,
    TColMetaData = object,
> {
    service: DataTableService<TColKey, TColMetaData> | null;
    rowActions?: Snippet<[string]>;
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
    pagination?: {
        action: ChangePageAction;
        oldPageIndex?: number;
        newPageIndex?: number;
    };
}

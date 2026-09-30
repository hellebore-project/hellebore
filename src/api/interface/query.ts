import type { DataType, PredicateType, SortOrder } from "../constants";

export interface Pagination {
    pageIndex?: number;
    offset?: number | null;
    limit?: number | null;
}

export interface SortItem<TPropKey> {
    field: TPropKey;
    order: SortOrder;
}

export type FilterPredicate<TVal> =
    | { type: PredicateType.Equal; value: TVal }
    | { type: PredicateType.NotEqual; value: TVal }
    | { type: PredicateType.GreaterThan; value: TVal }
    | { type: PredicateType.GreaterThanOrEqual; value: TVal }
    | { type: PredicateType.LessThan; value: TVal }
    | { type: PredicateType.LessThanOrEqual; value: TVal }
    | { type: PredicateType.In; values: TVal[] }
    | { type: PredicateType.NotIn; values: TVal[] }
    | { type: PredicateType.Like; value: TVal }
    | { type: PredicateType.NotLike; value: TVal };

export interface FilterItem<TPropKey, TVal> {
    field: TPropKey;
    predicate: FilterPredicate<TVal>;
}

export type FilterItemUnion<TPropKey> =
    | ({ type: DataType.Number } & FilterItem<TPropKey, number>)
    | ({ type: DataType.String } & FilterItem<TPropKey, string>)
    | ({ type: DataType.Uuid } & FilterItem<TPropKey, string>);

export interface QueryRequest<TPropKey, TOptions> {
    pagination?: Pagination;
    sortation?: SortItem<TPropKey>[];
    filters?: FilterItemUnion<TPropKey>[];
    options: TOptions;
    includeTotal?: boolean;
}

export interface QueryResponse<T> {
    items: T[];
    pageIndex: number;
    pageCount: number | null;
    total: number | null;
    offset: number | null;
    limit: number | null;
}

import type { DataType, SortOrder } from "../constants";

export interface Pagination {
    pageIndex?: number;
    offset?: number | null;
    limit?: number | null;
}

export interface SortItem<P> {
    field: P;
    order: SortOrder;
}

export enum PredicateType {
    Equal = "Equal",
    NotEqual = "NotEqual",
    GreaterThan = "GreaterThan",
    GreaterThanOrEqual = "GreaterThanOrEqual",
    LessThan = "LessThan",
    LessThanOrEqual = "LessThanOrEqual",
    In = "In",
    NotIn = "NotIn",
    Like = "Like",
    NotLike = "NotLike",
}

export type Predicate<T> =
    | { type: PredicateType.Equal; value: T }
    | { type: PredicateType.NotEqual; value: T }
    | { type: PredicateType.GreaterThan; value: T }
    | { type: PredicateType.GreaterThanOrEqual; value: T }
    | { type: PredicateType.LessThan; value: T }
    | { type: PredicateType.LessThanOrEqual; value: T }
    | { type: PredicateType.In; values: T[] }
    | { type: PredicateType.NotIn; values: T[] }
    | { type: PredicateType.Like; value: T }
    | { type: PredicateType.NotLike; value: T };

export interface FilterItem<P, T> {
    field: P;
    predicate: Predicate<T>;
}

export type FilterItemUnion<P> =
    | ({ type: DataType.Number } & FilterItem<P, number>)
    | ({ type: DataType.String } & FilterItem<P, string>)
    | ({ type: DataType.Uuid } & FilterItem<P, string>);

export interface QueryRequest<P, O> {
    pagination?: Pagination;
    sortation?: SortItem<P>[];
    filters?: FilterItemUnion<P>[];
    options: O;
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

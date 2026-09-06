import type { SortOrder } from "../constants";

export interface Pagination {
    pageIndex?: number;
    offset?: number | null;
    limit?: number | null;
}

export interface SortItem {
    field: string;
    order: SortOrder;
}

export interface QueryRequest<T> {
    data: T;
    pagination?: Pagination;
    sortation?: SortItem[];
    includeTotal?: boolean;
}

export interface QueryResponse<T> {
    items: T[];
    pageIndex: number;
    pageCount: number;
    total: number | null;
    offset: number | null;
    limit: number | null;
}

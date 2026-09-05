export interface Pagination {
    pageIndex?: number;
    offset?: number | null;
    limit?: number | null;
}

export interface QueryRequest<T> {
    data: T;
    pagination?: Pagination;
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

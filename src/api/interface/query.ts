export interface Pagination {
    page_index?: number;
    offset?: number | null;
    limit?: number | null;
}

export interface QueryRequest<T> {
    data: T;
    pagination?: Pagination;
    include_total?: boolean;
}

export interface QueryResponse<T> {
    items: T[];
    page_index: number;
    page_count: number;
    total: number | null;
    offset: number | null;
    limit: number | null;
}

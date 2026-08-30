export interface PaginationRequest<T> {
    data: T;
    page_index?: number;
    offset?: number;
    limit?: number;
    include_total?: boolean;
}

export interface PaginationResponse<T> {
    data: T[];
    page_index: number;
    page_count: number;
    item_count: number;
    total: number;
    offset: number | null;
    limit: number | null;
}

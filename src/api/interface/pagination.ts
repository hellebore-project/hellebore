export interface PaginationRequest<T> {
    data: T;
    offset?: number;
    limit?: number;
}

export interface PaginationResponse<T> {
    data: T;
    page_index: number;
    page_count: number;
    item_count: number;
    total: number;
    offset: number | null;
    limit: number | null;
}

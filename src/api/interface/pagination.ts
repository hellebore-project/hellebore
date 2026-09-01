export interface PaginationRequest<T> {
    data: T;
    page_index?: number;
    offset?: number | null;
    limit?: number | null;
    include_total?: boolean;
}

export interface PaginationResponse<T> {
    items: T[];
    page_index: number;
    page_count: number;
    item_count: number;
    total: number | null;
    offset: number | null;
    limit: number | null;
}

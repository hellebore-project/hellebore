export interface PaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => Promise<void>;
}

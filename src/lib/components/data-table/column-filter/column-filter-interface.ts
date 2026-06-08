import type { SelectColumn } from "../data-table-interface";
import type { DataTableService } from "../data-table-service.svelte";

export interface ColumnFilterProps<TColKey extends string = string> {
    service: DataTableService<TColKey>;
    colKey: TColKey;
}

export interface ColumnTextFilterProps<TColKey extends string = string> {
    service: DataTableService<TColKey>;
    colKey: TColKey;
}

export interface ColumnSelectFilterProps<TColKey extends string = string> {
    service: DataTableService<TColKey>;
    column: SelectColumn<TColKey>;
}

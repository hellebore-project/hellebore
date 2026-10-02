import type { SelectColumn } from "../data-table-interface";
import type { DataTableService } from "../data-table-service.svelte";

export interface ColumnFilterProps<
    TColKey extends string = string,
    TRowMetaData = object,
    TColMetaData = object,
> {
    service: DataTableService<TColKey, TRowMetaData, TColMetaData>;
    colKey: TColKey;
}

export interface ColumnTextFilterProps<
    TColKey extends string = string,
    TRowMetaData = object,
    TColMetaData = object,
> {
    service: DataTableService<TColKey, TRowMetaData, TColMetaData>;
    colKey: TColKey;
}

export interface ColumnSelectFilterProps<
    TColKey extends string = string,
    TRowMetaData = object,
    TColMetaData = object,
> {
    service: DataTableService<TColKey, TRowMetaData, TColMetaData>;
    column: SelectColumn<TColKey, TColMetaData>;
}

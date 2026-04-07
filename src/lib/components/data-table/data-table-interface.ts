export type PositionKey = string;

export interface CellState {
    value: string;
    oldValue?: string;
}

export interface DataRow<TColKey extends string> {
    key: string;
    cells: Record<TColKey, CellState>;
}

export interface TextColumnDef<TColKey extends string = string> {
    key: TColKey;
    label: string;
    type: "text";
    getLabel?: (rowKey: string, value: string) => string;
}

export interface SelectColumnDef<TColKey extends string = string> {
    key: TColKey;
    label: string;
    type: "select";
    items: { value: string; label: string }[];
    getLabel?: (rowKey: string, value: string) => string;
}

export type ColumnDef<TColKey extends string = string> =
    | TextColumnDef<TColKey>
    | SelectColumnDef<TColKey>;

export interface SelectionAnchor<TColKey extends string = string> {
    rowIndex: number;
    colKey: TColKey;
}

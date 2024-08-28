export enum FieldType {
    TEXT,
}

export interface FieldData {
    key: string;
    label: string;
    type: FieldType;
    getValue?: () => any;
    setValue?: (value: string) => void;
}

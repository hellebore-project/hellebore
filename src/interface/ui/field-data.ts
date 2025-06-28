export enum FieldType {
    TEXT,
}

export interface FieldData {
    property: string;
    label: string;
    type: FieldType;
    getValue?: () => any;
    setValue?: (value: string) => void;
}

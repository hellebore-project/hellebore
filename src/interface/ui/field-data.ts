import { OptionData } from "./common";

export enum FieldType {
    TEXT,
    SELECT,
}

export interface FieldData {
    property: string;
    type: FieldType;
    label: string;
    options?: OptionData[];
    getValue?: () => any;
    setValue?: (value: string) => void;
}

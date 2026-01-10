import { OptionData } from "../props";

export enum PropertyFieldType {
    TEXT,
    SELECT,
}

export interface PropertyFieldData {
    property: string;
    type: PropertyFieldType;
    label: string;
}

export interface TextPropertyFieldData extends PropertyFieldData {
    type: PropertyFieldType.TEXT;
    getValue?: () => string;
    setValue?: (value: string) => void;
}

export interface SelectPropertyFieldData extends PropertyFieldData {
    type: PropertyFieldType.SELECT;
    options?: OptionData[];
    getValue?: () => string;
    setValue?: (value: string) => void;
}

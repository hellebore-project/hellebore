import { OptionData } from "@/interface";

export enum PropertyFieldType {
    TEXT,
    SELECT,
}

export interface PropertyFieldData {
    property: string;
    type: PropertyFieldType;
    label: string;
    options?: OptionData[];
    getValue?: () => any;
    setValue?: (value: string) => void;
}

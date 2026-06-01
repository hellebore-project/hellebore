import type { PropertyFieldType } from "@/constants";

import type { OptionData } from "./option";

export interface PropertyFieldData {
    property: string;
    type: PropertyFieldType;
    label: string;
}

export interface TextPropertyFieldData extends PropertyFieldData {
    type: PropertyFieldType.Text;
    getValue: () => string;
    setValue: (value: string) => void;
}

export interface SelectPropertyFieldData extends PropertyFieldData {
    type: PropertyFieldType.Select;
    options?: OptionData[];
    getValue: () => string;
    setValue: (value: string) => void;
}

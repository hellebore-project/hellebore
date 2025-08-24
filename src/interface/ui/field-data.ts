import { FieldType } from "@/constants";
import { OptionData } from "./common";

export interface FieldData {
    property: string;
    type: FieldType;
    label: string;
    options?: OptionData[];
    getValue?: () => any;
    setValue?: (value: string) => void;
}

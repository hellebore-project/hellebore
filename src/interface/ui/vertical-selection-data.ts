import { SyntheticEvent } from "react";
import { BaseButtonSettings } from "./common";

export interface VerticalSelectionData extends BaseButtonSettings {
    index: number;
    label: string;
    onConfirm?: (e: SyntheticEvent<HTMLButtonElement>) => Promise<any>;
}

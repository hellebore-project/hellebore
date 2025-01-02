import { SyntheticEvent } from "react";
import { BaseButtonSettings } from "./common";

export interface VerticalMenuItemData extends BaseButtonSettings {
    index: number;
    label: string;
    onConfirm?: (e: SyntheticEvent<HTMLButtonElement>) => Promise<any>;
}

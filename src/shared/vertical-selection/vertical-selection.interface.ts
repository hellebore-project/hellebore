import { StackProps } from "@mantine/core";
import { SyntheticEvent } from "react";

import { BaseButtonSettings, BasePaperSettings } from "@/interface";

export interface VerticalSelectionData extends BaseButtonSettings {
    index: number;
    label: string;
    onConfirm?: (e: SyntheticEvent<HTMLButtonElement>) => Promise<void>;
}

export interface VerticalMenuSelectionSettings extends BaseButtonSettings {
    data: VerticalSelectionData;
    selected?: boolean;
}

export interface VerticalSelectionSettings extends BasePaperSettings {
    data: VerticalSelectionData[];
    placeholder?: string;
    getSelectedIndex: () => number | null;
    onConfirm?: (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalSelectionData,
    ) => Promise<void>;
    stackSettings?: StackProps;
    itemSettings?: BaseButtonSettings;
}

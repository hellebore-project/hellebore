import { StackProps } from "@mantine/core";
import { SyntheticEvent } from "react";

import { BaseButtonProps, BasePaperProps } from "@/interface";

export interface VerticalSelectionData extends BaseButtonProps {
    index: number;
    label: string;
    onConfirm?: (e: SyntheticEvent<HTMLButtonElement>) => Promise<unknown>;
}

export interface VerticalMenuSelectionProps extends BaseButtonProps {
    data: VerticalSelectionData;
    selected?: boolean;
}

export interface VerticalSelectionProps extends BasePaperProps {
    data: VerticalSelectionData[];
    placeholder?: string;
    getSelectedIndex: () => number | null;
    onConfirm?: (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalSelectionData,
    ) => Promise<void>;
    stackProps?: StackProps;
    itemProps?: BaseButtonProps;
}

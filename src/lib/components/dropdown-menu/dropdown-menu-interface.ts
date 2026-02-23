export const DIVIDER_DATA = "DIVIDER";

export interface DropdownMenuTextItemData {
    label: string;
    onClick?: () => void;
}

export type DropdownMenuItemData = DropdownMenuTextItemData | string;

export const DIVIDER_DATA = "DIVIDER";

export interface MenuDropdownItemData {
    label: string;
    onClick?: () => void;
}

export type MenuDropdownElementData = MenuDropdownItemData | string;

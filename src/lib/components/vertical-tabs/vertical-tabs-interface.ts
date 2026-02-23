export interface VerticalTabsItemData {
    label?: string;
    value: number | string;
}

export interface VerticalTabsItemProps {
    label?: string | number;
    value: number | string;
    active?: boolean;
    onclick?: () => void;
    class?: string;
}

export interface VerticalTabsProps {
    items: VerticalTabsItemData[];
    activeValue?: number | string;
    onSelect?: (value: number | string) => void;
    class?: string;
}

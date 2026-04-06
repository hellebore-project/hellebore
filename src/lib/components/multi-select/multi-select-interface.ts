export interface MultiSelectItem {
    label: string;
    value: string;
}

export interface MultiSelectProps {
    items: MultiSelectItem[];
    values: string[];
    onValueChange: (values: string[]) => void;
    placeholder?: string;
    class?: string;
}

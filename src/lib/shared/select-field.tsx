import { Select, ComboboxItem } from "@mantine/core";
import { observer } from "mobx-react-lite";

interface SelectFieldSettings {
    label: string;
    data: ComboboxItem[];
    getValue?: () => string | null;
    onChange?: (value: string | null, option: ComboboxItem) => void;
    placeholder?: string;
}

function renderSelectField({
    label,
    data,
    getValue,
    onChange,
    placeholder = "Select a value",
}: SelectFieldSettings) {
    const value = getValue ? getValue() : undefined;
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={data}
            value={value}
            onChange={onChange}
            allowDeselect
            clearable
        />
    );
}

export const SelectField = observer(renderSelectField);

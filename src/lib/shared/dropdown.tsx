import { Select, ComboboxItem } from "@mantine/core";
import { observer } from "mobx-react-lite";

interface DropdownSettings {
    label: string;
    items: string[];
    getValue?: () => any;
    onChange?: (value: string | null, option: ComboboxItem) => void;
    placeholder?: string;
}

function renderDropdown({
    label,
    items,
    getValue,
    onChange,
    placeholder = "Select a value",
}: DropdownSettings) {
    const value = getValue ? getValue() : undefined;
    return (
        <Select
            label={label}
            placeholder={placeholder}
            data={items}
            value={value}
            onChange={onChange}
            allowDeselect
            clearable
        />
    );
}

const Dropdown = observer(renderDropdown);

export default Dropdown;

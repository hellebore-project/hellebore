import { Select, SelectProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

interface SelectFieldSettings extends SelectProps {
    getValue?: () => string | null;
}

function renderSelectField({
    getValue,
    placeholder = "Select a value",
    clearable = true,
    ...rest
}: SelectFieldSettings) {
    const value = getValue ? getValue() : undefined;
    return (
        <Select
            placeholder={placeholder}
            value={value}
            allowDeselect
            clearable={clearable}
            {...rest}
        />
    );
}

export const SelectField = observer(renderSelectField);

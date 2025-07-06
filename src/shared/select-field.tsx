import { Select, SelectProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

interface SelectFieldSettings extends SelectProps {
    getValue?: () => string | null;
}

const renderSelectField = forwardRef<HTMLInputElement, SelectFieldSettings>(
    (
        {
            value,
            getValue,
            placeholder = "Select a value",
            clearable = true,
            ...rest
        },
        ref,
    ) => {
        const _value = value ?? getValue?.() ?? undefined;
        return (
            <Select
                ref={ref}
                placeholder={placeholder}
                value={_value}
                allowDeselect
                clearable={clearable}
                {...rest}
            />
        );
    },
);

export const SelectField = observer(renderSelectField);

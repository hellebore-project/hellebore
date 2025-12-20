import { Select, SelectProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

export interface SelectFieldProps extends SelectProps {
    getValue?: () => string | null;
}

const renderSelectField = forwardRef<HTMLInputElement, SelectFieldProps>(
    (
        {
            value,
            getValue,
            placeholder = "Select a value",
            clearable = true,
            comboboxProps,
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
                comboboxProps={comboboxProps}
                {...rest}
            />
        );
    },
);

export const SelectField = observer(renderSelectField);

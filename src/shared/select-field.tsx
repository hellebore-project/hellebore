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

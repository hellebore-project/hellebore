import { getService } from "@/client";
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
            comboboxProps,
            ...rest
        },
        ref,
    ) => {
        const service = getService();
        const _value = value ?? getValue?.() ?? undefined;
        comboboxProps = {
            portalProps: { target: service.view.sharedPortalSelector },
            ...(comboboxProps ?? {}),
        };
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

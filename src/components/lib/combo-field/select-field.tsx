import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

import { ComboField, ComboFieldProps } from "./combo-field";

const INPUT_STYLES = {
    input: { cursor: "pointer" },
};

const renderSelectField = forwardRef<HTMLInputElement, ComboFieldProps>(
    ({ service, dropdownProps, inputProps }, ref) => {
        return (
            <ComboField
                ref={ref}
                service={service}
                dropdownProps={dropdownProps}
                inputProps={{
                    editable: false,
                    styles: INPUT_STYLES,
                    ...inputProps,
                }}
            />
        );
    },
);

export const SelectField = observer(renderSelectField);

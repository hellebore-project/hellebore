import { BaseTextInputSettings } from "@/interface";
import { TextInput } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

export interface TextFieldSettings extends BaseTextInputSettings {
    value?: string;
    getValue?: () => string;
    error?: boolean | string;
    getError?: () => string | null;
}

const renderTextField = forwardRef<HTMLInputElement, TextFieldSettings>(
    ({ value, getValue, error, getError, ...rest }, ref) => {
        const _value = getValue ? getValue() : value;
        const _error = getError ? getError() : error;
        return <TextInput ref={ref} value={_value} error={_error} {...rest} />;
    },
);

export const TextField = observer(renderTextField);

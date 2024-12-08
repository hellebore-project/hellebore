import { TextInput, TextInputProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { ForwardedRef } from "react";

export interface TextFieldSettings extends TextInputProps {
    value?: string;
    getValue?: () => string;
    error?: boolean | string;
    getError?: () => string | null;
    inputRef?: ForwardedRef<HTMLInputElement>;
}

function renderTextField({
    value,
    getValue,
    error,
    getError,
    inputRef,
    ...rest
}: TextFieldSettings) {
    const _value = getValue ? getValue() : value;
    const _error = getError ? getError() : error;
    return <TextInput ref={inputRef} value={_value} error={_error} {...rest} />;
}

export const TextField = observer(renderTextField);

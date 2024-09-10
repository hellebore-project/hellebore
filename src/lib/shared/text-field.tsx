import { TextInput, TextInputProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { ForwardedRef } from "react";

export interface TextFieldSettings extends TextInputProps {
    value?: string;
    getValue?: () => string;
    getError?: () => string | null;
    inputRef?: ForwardedRef<HTMLInputElement>;
}

function renderTextField({
    value,
    getValue,
    getError,
    inputRef,
    ...rest
}: TextFieldSettings) {
    const _value = getValue ? getValue() : value;
    const error = getError ? getError() : null;

    const props: TextInputProps = {
        value: _value,
        ...rest,
    };
    if (error) props["error"] = error;

    return <TextInput ref={inputRef} {...props} />;
}

export const TextField = observer(renderTextField);

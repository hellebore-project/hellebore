import { TextInput, TextInputProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

export interface TextFieldSettings extends TextInputProps {
    value?: string;
    getValue?: () => string;
    getError?: () => string | null;
}

function renderTextField({
    value,
    getValue,
    getError,
    ...rest
}: TextFieldSettings) {
    const _value = getValue ? getValue() : value;
    const error = getError ? getError() : null;

    const props: TextInputProps = {
        value: _value,
        ...rest,
    };
    if (error) props["error"] = error;

    return <TextInput {...props} />;
}

export const TextField = observer(renderTextField);

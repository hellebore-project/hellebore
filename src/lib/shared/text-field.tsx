import { TextInput, TextInputProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

export interface TextFieldSettings extends TextInputProps {
    variant?: string;
    label?: string;
    placeholder?: string;
    getValue?: () => string;
    getError?: () => string | null;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function renderTextField({
    variant = "default",
    label,
    placeholder,
    getValue,
    getError,
    onChange,
    ...rest
}: TextFieldSettings) {
    const value = getValue ? getValue() : undefined;
    const error = getError ? getError() : null;

    const props: TextInputProps = {
        label,
        value,
        placeholder,
        onChange,
        ...rest,
    };
    if (variant && variant != "default") props["variant"] = variant;
    if (label) props["label"] = label;
    if (error) props["error"] = error;

    return <TextInput {...props} />;
}

const TextField = observer(renderTextField);

export default TextField;

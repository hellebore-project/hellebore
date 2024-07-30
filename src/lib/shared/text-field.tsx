import { TextInput, TextInputProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

export interface TextFieldSettings {
    label: string;
    placeholder?: string;
    getValue?: () => string;
    getError?: () => string | null;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function renderTextField({
    label,
    placeholder,
    getValue,
    getError,
    onChange,
}: TextFieldSettings) {
    const value = getValue ? getValue() : undefined;
    const error = getError ? getError() : null;

    const props: TextInputProps = {
        mt: "md",
        label,
        value,
        placeholder,
        onChange,
    };
    if (error) props["error"] = error;

    return <TextInput {...props} />;
}

const TextField = observer(renderTextField);

export default TextField;

import { Button, ButtonProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import React from "react";

type BaseButtonSettings = ButtonProps &
    React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface FormButtonSettings extends BaseButtonSettings {
    label?: string;
}

function renderFormButton({ label, ...rest }: FormButtonSettings) {
    return (
        <Button variant="filled" {...rest}>
            {label ?? ""}
        </Button>
    );
}

export const FormButton = observer(renderFormButton);

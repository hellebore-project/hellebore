import { Button } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseButtonProps } from "@/interface";

export interface FormButtonProps extends BaseButtonProps {
    label?: string;
}

function renderFormButton({ label, ...rest }: FormButtonProps) {
    return (
        <Button variant="filled" {...rest}>
            {label ?? ""}
        </Button>
    );
}

export const FormButton = observer(renderFormButton);

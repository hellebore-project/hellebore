import { Text } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef, RefObject } from "react";

import { BaseTextInputProps, BaseTextProps } from "@/interface";

import { TextField } from "../text-field";

export interface NavItemTextProps {
    editable?: boolean;
    text?: string;
    getText?: () => string;
    error?: string;
    textProps?: BaseTextProps;
    textInputProps?: Omit<BaseTextInputProps, "value" | "error">;
    ref_?: RefObject<HTMLInputElement>;
}

const renderNavItemText = forwardRef<HTMLInputElement, NavItemTextProps>(
    ({ editable, text, getText, error, textProps, textInputProps }, ref) => {
        if (text === undefined) {
            if (getText) text = getText();
            else text = "";
        }

        if (editable) {
            let className = "nav-item-text editable";
            if (error) className += " error";

            return (
                <TextField
                    className={className}
                    value={text as string}
                    ref={ref}
                    {...textInputProps}
                />
            );
        }

        return (
            <Text className="nav-item-text" {...textProps}>
                {text}
            </Text>
        );
    },
);

export const NavItemText = observer(renderNavItemText);

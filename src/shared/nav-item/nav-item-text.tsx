import { Text } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef, RefObject } from "react";

import { BaseTextInputSettings, BaseTextSettings } from "@/interface";

import { TextField } from "../text-field";

export interface NavItemTextSettings {
    editable?: boolean;
    text?: string;
    getText?: () => string;
    error?: string;
    textSettings?: BaseTextSettings;
    textInputSettings?: Omit<BaseTextInputSettings, "value" | "error">;
    ref_?: RefObject<HTMLInputElement>;
}

const renderNavItemText = forwardRef<HTMLInputElement, NavItemTextSettings>(
    (
        { editable, text, getText, error, textSettings, textInputSettings },
        ref,
    ) => {
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
                    {...textInputSettings}
                />
            );
        }

        return (
            <Text className="nav-item-text" {...textSettings}>
                {text}
            </Text>
        );
    },
);

export const NavItemText = observer(renderNavItemText);

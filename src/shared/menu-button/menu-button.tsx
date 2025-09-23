import "./menu-button.css";

import { Button } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

import { BaseButtonSettings } from "@/interface";

export interface MenuButtonSettings extends BaseButtonSettings {
    label?: string;
}

const renderMenuButton = forwardRef<HTMLButtonElement, MenuButtonSettings>(
    ({ label, ...rest }, ref) => {
        return (
            <Button
                ref={ref}
                className="menu-button"
                size="compact-sm"
                {...rest}
            >
                {label ?? ""}
            </Button>
        );
    },
);

export const MenuButton = observer(renderMenuButton);

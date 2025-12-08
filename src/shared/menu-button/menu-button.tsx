import "./menu-button.css";

import { Button } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

import { BaseButtonProps } from "@/interface";

export interface MenuButtonProps extends BaseButtonProps {
    label?: string;
}

const renderMenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
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

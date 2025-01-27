import { Button } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseButtonSettings } from "@/interface";

export interface MenuButtonSettings extends BaseButtonSettings {
    label?: string;
}

function renderMenuButton({ label, ...rest }: MenuButtonSettings) {
    return (
        <Button
            variant="filled"
            color="var(--mantine-color-dark-7)"
            size="compact-sm"
            {...rest}
        >
            {label ?? ""}
        </Button>
    );
}

export const MenuButton = observer(renderMenuButton);

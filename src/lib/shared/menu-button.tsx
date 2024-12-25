import { Button } from "@mantine/core";
import { observer } from "mobx-react-lite";

export interface MenuButtonSettings {
    label: string;
    onClick?: () => void;
}

function renderMenuButton({ label, onClick }: MenuButtonSettings) {
    return (
        <Button
            variant="filled"
            color="var(--mantine-color-dark-7)"
            size="compact-sm"
            onClick={onClick}
        >
            {label}
        </Button>
    );
}

export const MenuButton = observer(renderMenuButton);

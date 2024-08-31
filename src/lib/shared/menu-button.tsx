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
            color="gray"
            size="compact-md"
            onClick={onClick}
        >
            {label}
        </Button>
    );
}

export const MenuButton = observer(renderMenuButton);

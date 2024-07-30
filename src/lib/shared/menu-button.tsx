import { Button } from "@mantine/core";

export interface MenuButtonSettings {
    label: string;
    onClick?: () => void;
}

function MenuButton({ label, onClick }: MenuButtonSettings) {
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

export default MenuButton;

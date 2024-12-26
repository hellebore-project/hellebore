import { Button, Menu } from "@mantine/core";
import { observer } from "mobx-react-lite";

export const DIVIDER = "DIVIDER";

interface MenuDropdownItemData {
    label: string;
    onClick?: () => void;
}

export type MenuDropdownElementData = MenuDropdownItemData | string;

interface MenuElementSettings {
    data: MenuDropdownElementData;
}

interface MenuDropdownSettings {
    label: string;
    elements: MenuDropdownElementData[];
}

function renderMenuDropdownElement({ data }: MenuElementSettings) {
    if (data === DIVIDER) return <Menu.Divider />;
    else if (typeof data === "string") return <Menu.Label>{data}</Menu.Label>;

    const { label, onClick } = data;
    if (!onClick) return <Menu.Label>{label}</Menu.Label>;
    return (
        <Menu.Item key={label} onClick={onClick}>
            {label}
        </Menu.Item>
    );
}

export const MenuDropdownElement = observer(renderMenuDropdownElement);

function renderMenuDropdown({ label, elements }: MenuDropdownSettings) {
    return (
        <Menu
            trigger="click"
            closeOnItemClick={true}
            closeOnClickOutside={true}
            position="top-start"
            offset={0}
            shadow="md"
        >
            <Menu.Target>
                <Button
                    variant="filled"
                    color="var(--mantine-color-dark-7)"
                    size="compact-sm"
                >
                    {label}
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                {elements.map((element, index) => (
                    <MenuDropdownElement
                        key={`${label}-${index}`}
                        data={element}
                    />
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}

export const MenuDropdown = observer(renderMenuDropdown);

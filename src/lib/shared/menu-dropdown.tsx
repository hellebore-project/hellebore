import { Button, Menu } from "@mantine/core";

interface MenuItemData {
    label: string;
    onClick?: () => void;
}

interface MenuDropdownSettings {
    label: string;
    items: MenuItemData[];
}

function MenuDropdown({ label, items }: MenuDropdownSettings) {
    const menuItems = items.map(({ label, onClick }) => (
        <Menu.Item key={label} onClick={onClick}>
            {label}
        </Menu.Item>
    ));

    return (
        <Menu
            trigger="click"
            closeOnItemClick={true}
            closeOnClickOutside={true}
            position="top-start"
            shadow="md"
        >
            <Menu.Target>
                <Button variant="filled" color="gray" size="compact-md">
                    {label}
                </Button>
            </Menu.Target>
            <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
    );
}

export default MenuDropdown;

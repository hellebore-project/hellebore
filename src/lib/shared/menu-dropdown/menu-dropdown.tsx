import "./menu-button.css";

import { BaseButtonSettings } from "@/interface";
import { Button, Menu, MenuProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

export const DIVIDER_DATA = "DIVIDER";

interface MenuDropdownItemData {
    label: string;
    onClick?: () => void;
}

export type MenuDropdownElementData = MenuDropdownItemData | string;

interface MenuElementSettings {
    data: MenuDropdownElementData;
}

interface MenuDropdownSettings extends MenuProps {
    label: string;
    data: MenuDropdownElementData[];
    buttonSettings?: BaseButtonSettings;
}

function renderMenuDropdownElement({ data }: MenuElementSettings) {
    if (data === DIVIDER_DATA) return <Menu.Divider />;
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

function renderMenuDropdown({
    label,
    data,
    buttonSettings,
    ...rest
}: MenuDropdownSettings) {
    if (!buttonSettings) buttonSettings = {};
    return (
        <Menu
            trigger="click"
            closeOnItemClick={true}
            closeOnClickOutside={true}
            position="top-start"
            offset={0}
            shadow="md"
            {...rest}
        >
            <Menu.Target>
                <Button
                    className="menu-button"
                    size="compact-sm"
                    {...buttonSettings}
                >
                    {label}
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                {data.map((element, index) => (
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

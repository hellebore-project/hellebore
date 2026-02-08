import { Menu, MenuProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseButtonProps } from "@/interface";
import { MenuButton } from "@/components/react/lib/menu-button";

import {
    DIVIDER_DATA,
    MenuDropdownElementData,
} from "./menu-dropdown.interface";

interface MenuElementProps {
    data: MenuDropdownElementData;
}

interface MenuDropdownProps extends MenuProps {
    label: string;
    data: MenuDropdownElementData[];
    buttonProps?: BaseButtonProps;
}

function renderMenuDropdownElement({ data }: MenuElementProps) {
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
    buttonProps,
    ...rest
}: MenuDropdownProps) {
    if (!buttonProps) buttonProps = {};
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
                <MenuButton
                    label={label}
                    // HACK: need to include the class name because for some reason
                    // mantine is ignoring the class of the underlying component
                    className="menu-button"
                    {...buttonProps}
                />
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

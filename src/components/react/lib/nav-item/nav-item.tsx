import "./nav-item.css";

import { Group } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactNode } from "react";

import { BaseGroupProps } from "@/interface";

import { NavItemText, NavItemTextProps } from "./nav-item-text";
import { NavItemIndents } from "./nav-item-indents";
import {
    EXPAND_BUTTON_PLACEHOLDER,
    ExpandButton,
    ExpandButtonProps,
} from "./nav-item-expand-button";

interface NavItemProps extends PropsWithChildren {
    selected?: boolean;
    active?: boolean;
    focused?: boolean;
    rank?: number;
    groupProps?: BaseGroupProps;
    expandButtonProps?: ExpandButtonProps;
    textProps?: NavItemTextProps;
}

function renderNavItem({
    selected = false,
    active = false,
    focused = false,
    rank = 0,
    groupProps,
    expandButtonProps,
    textProps,
    children,
}: NavItemProps) {
    const id = groupProps?.id ?? "nav-item";

    // Expand button
    let expandNode: ReactNode;
    if (expandButtonProps?.expandable ?? false)
        expandNode = <ExpandButton {...expandButtonProps} />;
    else expandNode = EXPAND_BUTTON_PLACEHOLDER;

    // Text
    const editable = textProps?.editable ?? false;
    const error = textProps?.error ?? undefined;
    const { ref_, ...textRest } = textProps ?? {};

    // Grid

    let className = "nav-item";
    if (active) className += " active";
    if (!editable) {
        // only change the colour of the item if it's read-only
        if (focused) className += " focused";
        // item can either be in error mode or in selected mode, but not both
        if (error) className += " error";
        else if (selected) className += " selected";
    }

    return (
        <Group className={className} gap={0} align="stretch" {...groupProps}>
            <NavItemIndents itemKey={id} rank={rank} />
            {expandNode}
            <NavItemText ref={ref_} {...textRest} />
            {children}
        </Group>
    );
}

export const NavItem = observer(renderNavItem);

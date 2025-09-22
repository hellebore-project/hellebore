import "./nav-item.css";

import { Group } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactNode } from "react";

import { BaseGroupSettings } from "@/interface";

import {
    EXPAND_BUTTON_PLACEHOLDER,
    ExpandButton,
    ExpandButtonSettings,
} from "./nav-item-expand-button";
import { NavItemIndents } from "./nav-item-indents";
import { NavItemText, NavItemTextSettings } from "./nav-item-text";

interface NavItemSettings extends PropsWithChildren {
    selected?: boolean;
    active?: boolean;
    focused?: boolean;
    rank?: number;
    groupSettings?: BaseGroupSettings;
    expandButtonSettings?: ExpandButtonSettings;
    textSettings?: NavItemTextSettings;
}

function renderNavItem({
    selected = false,
    active = false,
    focused = false,
    rank = 0,
    groupSettings,
    expandButtonSettings,
    textSettings,
    children,
}: NavItemSettings) {
    const id = groupSettings?.id ?? "nav-item";

    // Expand button
    let expandNode: ReactNode;
    if (expandButtonSettings?.expandable ?? false)
        expandNode = <ExpandButton {...expandButtonSettings} />;
    else expandNode = EXPAND_BUTTON_PLACEHOLDER;

    // Text
    const editable = textSettings?.editable ?? false;
    const error = textSettings?.error ?? undefined;
    const { ref_, ...textRest } = textSettings ?? {};

    // Grid

    let className = "nav-item dynamic-div";
    if (active) className += " active";
    if (!editable) {
        // only change the colour of the item if it's read-only
        if (focused) className += " focused";
        // item can either be in error mode or in selected mode, but not both
        if (error) className += " error";
        else if (selected) className += " selected";
    }

    return (
        <Group className={className} gap={0} align="stretch" {...groupSettings}>
            <NavItemIndents itemKey={id} rank={rank} />
            {expandNode}
            <NavItemText ref={ref_} {...textRest} />
            {children}
        </Group>
    );
}

export const NavItem = observer(renderNavItem);

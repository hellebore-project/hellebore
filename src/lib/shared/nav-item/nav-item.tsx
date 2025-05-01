import "./nav-item.css";

import { Grid, Group, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { forwardRef, PropsWithChildren, ReactNode, RefObject } from "react";

import {
    BaseGridColSettings,
    BaseGridSettings,
    BaseGroupSettings,
    BaseTextInputSettings,
    BaseTextSettings,
} from "@/interface";
import { range } from "@/utils/collections";

import { TextField } from "../text-field";

const DEFAULT_NAV_ITEM_STYLES = {
    inner: {
        // margin defaults to negative value, resulting in overlap with adjacent nav items
        margin: 0,
        // by default, nav item overflows on the right
        width: "100%",
    },
};

const EXPAND_BUTTON_PLACEHOLDER = (
    <div className="nav-item-expand-button-placeholder" />
);

export interface IndentSettings {
    count?: number;
}

export interface ExpandButtonSettings {
    expandable?: boolean;
    expanded?: boolean;
    isExpanded?: () => boolean;
}

export interface NavItemTextSettings {
    editable?: boolean;
    text?: string;
    getText?: () => string;
    error?: string;
    textSettings?: BaseTextSettings;
    textInputSettings?: Omit<BaseTextInputSettings, "value" | "error">;
    ref_?: RefObject<HTMLInputElement>;
}

interface NavItemSettings extends PropsWithChildren {
    selected?: boolean;
    active?: boolean;
    focused?: boolean;
    rank?: number;
    groupSettings?: BaseGroupSettings;
    expandButtonSettings?: ExpandButtonSettings;
    textSettings?: NavItemTextSettings;
}

function renderExpandButton({
    expanded = false,
    isExpanded,
}: ExpandButtonSettings) {
    expanded = isExpanded?.() ?? expanded;
    return (
        <IconChevronRight
            className="nav-sub-item compact"
            size={18}
            style={{
                paddingBlock: "0px",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
        />
    );
}

const ExpandButton = observer(renderExpandButton);

const renderNavItemText = forwardRef<HTMLInputElement, NavItemTextSettings>(
    (
        { editable, text, getText, error, textSettings, textInputSettings },
        ref,
    ) => {
        if (text === undefined) {
            if (getText) text = getText();
            else text = "";
        }

        if (editable) {
            let className = "nav-item-text editable";
            if (error) className += " error";

            return (
                <TextField
                    className={className}
                    value={text as string}
                    ref={ref}
                    {...textInputSettings}
                />
            );
        }

        return (
            <Text className="nav-item-text" {...textSettings}>
                {text}
            </Text>
        );
    },
);

const NavItemText = observer(renderNavItemText);

function renderNavItem({
    selected = false,
    active = false,
    focused = false,
    rank = 0,
    groupSettings: groupSettings,
    expandButtonSettings,
    textSettings,
    children,
}: NavItemSettings) {
    const id = groupSettings?.id ?? "nav-item";

    // Leading indents
    let indentItem: ReactNode = null;
    if (rank > 0) {
        indentItem = range(rank).map((i) => (
            <div
                key={`${id}-indent-${i}`}
                className="nav-item-indent nav-sub-item compact"
            />
        ));
    }

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

    const { styles, ...groupRest } = groupSettings ?? {};

    return (
        <Group className={className} gap={0} {...groupRest}>
            {indentItem}
            {expandNode}
            <NavItemText ref={ref_} {...textRest} />
            {children}
        </Group>
    );
}

export const NavItem = observer(renderNavItem);

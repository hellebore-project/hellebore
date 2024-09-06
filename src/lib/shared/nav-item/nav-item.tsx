import { Grid, GridColProps, GridProps, Text, TextProps } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { CSSProperties, PropsWithChildren, ReactNode } from "react";

import { TextField, TextFieldSettings } from "../text-field";
import { range } from "../../utils/array";

import "./nav-item.css";

const GRID_STYLES = {
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

export interface TextSettings extends TextProps {
    value?: string;
    getValue?: () => string;
}

interface NavSubItemSettings extends GridColProps {}

interface NavItemSettings extends PropsWithChildren<GridProps> {
    indentSettings?: IndentSettings;
    expandButtonSettings?: ExpandButtonSettings;
    textSettings?: TextSettings;
    textInputSettings?: TextFieldSettings;
}

function renderExpandButton({
    expanded = false,
    isExpanded,
}: ExpandButtonSettings) {
    expanded = isExpanded?.() ?? expanded;
    return (
        <IconChevronRight
            size={18}
            style={{
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
        />
    );
}

const ExpandButton = observer(renderExpandButton);

function renderNavSubItem({ children, ...rest }: NavSubItemSettings) {
    return (
        <Grid.Col className="nav-sub-item" display="flex" {...rest}>
            {children}
        </Grid.Col>
    );
}

export const NavSubItem = observer(renderNavSubItem);

function renderNavItem({
    indentSettings = {},
    expandButtonSettings = {},
    textSettings = {},
    textInputSettings = {},
    children,
    ...rest
}: NavItemSettings) {
    // Leading indents
    let indentItem: ReactNode = null;
    const indentCount = indentSettings?.count ?? 0;
    if (indentCount > 0) {
        indentItem = (
            <NavSubItem span="content" px="0" py="0">
                {range(indentCount).map((i) => (
                    <div key={i} className="nav-item-indent" />
                ))}
            </NavSubItem>
        );
    }

    // Expand button
    let expandNode: ReactNode;
    if (expandButtonSettings.expandable)
        expandNode = <ExpandButton {...expandButtonSettings} />;
    else expandNode = EXPAND_BUTTON_PLACEHOLDER;

    // Text
    let textNode: ReactNode;
    if (textInputSettings.readOnly === false) {
        textNode = <TextField {...textInputSettings} />;
    } else {
        const _text = textSettings?.getValue?.() ?? textSettings?.value;
        textNode = (
            <Text className="nav-item-text" {...textSettings}>
                {_text}
            </Text>
        );
    }

    return (
        <Grid
            className="nav-item"
            align="center"
            px="4"
            styles={GRID_STYLES}
            {...rest}
        >
            {indentItem}
            <NavSubItem span="content" py="0">
                {expandNode}
            </NavSubItem>
            <NavSubItem span="auto" px="0" py="0">
                {textNode}
            </NavSubItem>
            {children}
        </Grid>
    );
}

export const NavItem = observer(renderNavItem);

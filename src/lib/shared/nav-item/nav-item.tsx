import {
    Grid,
    GridColProps,
    GridProps,
    Popover,
    PopoverProps,
    Text,
    TextProps,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { forwardRef, PropsWithChildren, ReactNode } from "react";

import { range } from "@/utils/array";
import { TextField, TextFieldSettings } from "../text-field";

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

export interface PopoverSettings extends PopoverProps {
    text?: string;
}

export interface NavSubItemSettings extends GridColProps {}

interface NavItemSettings extends PropsWithChildren<GridProps> {
    indentSettings?: IndentSettings;
    expandButtonSettings?: ExpandButtonSettings;
    textSettings?: TextSettings;
    textInputSettings?: TextFieldSettings;
    popoverSettings?: PopoverSettings;
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

const renderReadOnlyText = forwardRef<HTMLParagraphElement, TextSettings>(
    ({ value, getValue, ...rest }, ref) => {
        const _text = getValue?.() ?? value;
        return (
            <Text className="nav-item-text" {...rest}>
                {_text}
            </Text>
        );
    },
);

const ReadOnlyText = observer(renderReadOnlyText);

const renderEditableText = forwardRef<HTMLInputElement, TextFieldSettings>(
    (settings, ref) => {
        return <TextField inputRef={ref} {...settings} />;
    },
);

const EditableText = observer(renderEditableText);

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
    popoverSettings = {},
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
                <Popover
                    width={200}
                    position="bottom-start"
                    offset={0}
                    withArrow
                    arrowPosition="side"
                    shadow="md"
                    opened={popoverSettings.opened ?? false}
                >
                    <Popover.Target>
                        {textInputSettings.readOnly === false ? (
                            <EditableText {...textInputSettings} />
                        ) : (
                            <ReadOnlyText {...textSettings} />
                        )}
                    </Popover.Target>
                    <Popover.Dropdown style={{ pointerEvents: "none" }}>
                        <Text size="sm">{popoverSettings.text}</Text>
                    </Popover.Dropdown>
                </Popover>
            </NavSubItem>
            {children}
        </Grid>
    );
}

export const NavItem = observer(renderNavItem);

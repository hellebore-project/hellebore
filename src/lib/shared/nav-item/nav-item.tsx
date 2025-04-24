import { Grid, Popover, PopoverProps, Text, TextProps } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import {
    createRef,
    forwardRef,
    PropsWithChildren,
    ReactNode,
    RefObject,
    useEffect,
} from "react";

import { BaseGridColSettings, BaseGridSettings } from "@/interface";
import { range } from "@/utils/collections";

import { TextField, TextFieldSettings } from "../text-field";

import "./nav-item.css";

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

export interface TextSettings extends TextProps {
    value?: string;
    getValue?: () => string;
}

export interface PopoverSettings extends PopoverProps {
    text?: string;
}

export interface EditableTextSettings extends TextFieldSettings {
    popoverSettings?: PopoverSettings;
}

export interface NavSubItemSettings extends BaseGridColSettings {}

interface NavItemSettings extends PropsWithChildren<BaseGridSettings> {
    selected?: boolean;
    active?: boolean;
    focused?: boolean;
    rank?: number;
    expandButtonSettings?: ExpandButtonSettings;
    textSettings?: TextSettings;
    textInputSettings?: EditableTextSettings;
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

function renderReadOnlyText({ value, getValue, ...rest }: TextSettings) {
    const _text = getValue?.() ?? value;
    return (
        <Text className="nav-item-text" {...rest}>
            {_text}
        </Text>
    );
}

const ReadOnlyText = observer(renderReadOnlyText);

const renderEditableText = forwardRef<HTMLInputElement, EditableTextSettings>(
    ({ popoverSettings, ...rest }, ref) => {
        return (
            <Popover
                width={200}
                position="bottom-start"
                offset={0}
                withArrow
                arrowPosition="side"
                shadow="md"
                opened={popoverSettings?.opened ?? false}
            >
                <Popover.Target>
                    <TextField ref={ref} {...rest} />
                </Popover.Target>
                <Popover.Dropdown className="nav-item-popover-dropdown">
                    <Text size="sm">{popoverSettings?.text ?? ""}</Text>
                </Popover.Dropdown>
            </Popover>
        );
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
    selected = false,
    active = false,
    focused = false,
    rank = 0,
    expandButtonSettings,
    textSettings,
    textInputSettings,
    styles,
    children,
    ...rest
}: NavItemSettings) {
    // class
    let className = "nav-item dynamic-div";
    if (selected) className += " selected";
    if (active) className += " active";
    if (focused) className += " focused";

    // Leading indents
    let indentItem: ReactNode = null;
    if (rank > 0) {
        indentItem = (
            <NavSubItem span="content" px="0" py="0">
                {range(rank).map((i) => (
                    <div key={i} className="nav-item-indent" />
                ))}
            </NavSubItem>
        );
    }

    // Expand button
    let expandNode: ReactNode;
    if (expandButtonSettings?.expandable ?? false)
        expandNode = <ExpandButton {...expandButtonSettings} />;
    else expandNode = EXPAND_BUTTON_PLACEHOLDER;

    // text field
    const ref: RefObject<HTMLInputElement> = createRef();
    useEffect(() => {
        if (ref?.current) {
            // focus the text field once it has been added to the DOM
            ref.current.focus();
        }
    }, [ref]);

    return (
        <Grid
            className={className}
            align="center"
            styles={{ ...DEFAULT_NAV_ITEM_STYLES, ...(styles ?? {}) }}
            {...rest}
        >
            {indentItem}
            <NavSubItem span="content" py="0">
                {expandNode}
            </NavSubItem>
            <NavSubItem span="auto" px="0" py="0">
                {textInputSettings?.readOnly === false ? (
                    <EditableText ref={ref} {...textInputSettings} />
                ) : (
                    <ReadOnlyText {...textSettings} />
                )}
            </NavSubItem>
            {children}
        </Grid>
    );
}

export const NavItem = observer(renderNavItem);

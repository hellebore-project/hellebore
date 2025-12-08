import "./vertical-selection.css";

import { Button, Paper, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { ReactElement, SyntheticEvent } from "react";

import {
    VerticalMenuSelectionProps,
    VerticalSelectionProps,
} from "./vertical-selection.interface";

function renderVerticalSelectionItem({
    data,
    selected = false,
    className = "",
    style: sharedStyle,
    ...sharedAttrs
}: VerticalMenuSelectionProps) {
    const {
        className: uniqueClassName,
        index,
        label,
        style: uniqueStyle,
        ...uniqueAttrs
    } = data;
    delete uniqueAttrs.onConfirm;

    let _className = "vertical-selection-item";
    if (uniqueClassName) _className += ` ${uniqueClassName}`;
    else _className += ` ${className}`;
    if (selected) _className += " selected";

    return (
        <Button
            className={_className}
            px="sm"
            style={{
                ...sharedStyle,
                ...uniqueStyle,
            }}
            {...sharedAttrs}
            {...uniqueAttrs}
            {...{ "data-index": index }}
        >
            {label}
        </Button>
    );
}

const VerticalSelectionItem = observer(renderVerticalSelectionItem);

const renderVerticalSelection = ({
    data,
    placeholder,
    getSelectedIndex,
    onConfirm,
    stackProps,
    itemProps,
    ...rest
}: VerticalSelectionProps) => {
    let options: ReactElement[];
    if (data.length) {
        const selectedIndex = getSelectedIndex() ?? null;
        options = data.map((itemData) => (
            <VerticalSelectionItem
                key={`${itemData.value}`}
                data={itemData}
                selected={itemData.index == selectedIndex}
                onClick={async (e: SyntheticEvent<HTMLButtonElement>) => {
                    if (onConfirm) onConfirm(e, itemData);
                    else if (itemData.onConfirm) itemData.onConfirm(e);
                }}
                {...itemProps}
            />
        ));
    } else {
        if (placeholder)
            options = [
                <VerticalSelectionItem
                    key="null"
                    data={{ index: 0, label: placeholder, disabled: true }}
                />,
            ];
        else options = [];
    }

    const { className = "", ...stackRest } = stackProps ?? {};

    return (
        <Paper {...rest}>
            <Stack
                className={`vertical-selection-stack ${className}`}
                gap={0}
                {...stackRest}
            >
                {options}
            </Stack>
        </Paper>
    );
};

export const VerticalSelection = observer(renderVerticalSelection);

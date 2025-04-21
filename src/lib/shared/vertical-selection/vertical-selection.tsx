import "./vertical-selection.css";

import { Button, Paper, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { ReactElement, SyntheticEvent } from "react";

import {
    BaseButtonSettings,
    BasePaperSettings,
    VerticalSelectionData,
} from "@/interface";

interface VerticalMenuSelectionSettings extends BaseButtonSettings {
    data: VerticalSelectionData;
    selected?: boolean;
}

export interface VerticalSelectionSettings extends BasePaperSettings {
    data: VerticalSelectionData[];
    placeholder?: string;
    getSelectedIndex: () => number | null;
    onConfirm?: (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalSelectionData,
    ) => Promise<void>;
    stackSettings?: StackProps;
    itemSettings?: BaseButtonSettings;
}

function renderVerticalSelectionItem({
    data,
    selected = false,
    className = "",
    style: sharedStyle,
    ...sharedAttrs
}: VerticalMenuSelectionSettings) {
    let {
        className: uniqueClassName,
        index,
        label,
        onConfirm,
        style: uniqueStyle,
        ...uniqueAttrs
    } = data;

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
    stackSettings,
    itemSettings,
    ...rest
}: VerticalSelectionSettings) => {
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
                {...itemSettings}
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

    const { className = "", ...stackRest } = stackSettings ?? {};

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

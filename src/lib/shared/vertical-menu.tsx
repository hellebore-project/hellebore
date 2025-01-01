import { Button, Paper, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { ReactElement, SyntheticEvent } from "react";

import { BasePaperSettings, BaseButtonSettings } from "./common";

export interface VerticalMenuItemData extends BaseButtonSettings {
    index: number;
    label: string;
    onConfirm?: (e: SyntheticEvent<HTMLButtonElement>) => Promise<any>;
}

interface VerticalMenuItemSettings extends BaseButtonSettings {
    data: VerticalMenuItemData;
    selected?: boolean;
}

export interface VerticalMenuSettings extends BasePaperSettings {
    data: VerticalMenuItemData[];
    placeholder?: string;
    getSelectedIndex: () => number | null;
    onConfirm?: (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalMenuItemData,
    ) => Promise<void>;
    stack?: StackProps;
    item?: BaseButtonSettings;
}

function renderVerticalMenuItem({
    data,
    selected = false,
    ...sharedAttrs
}: VerticalMenuItemSettings) {
    let {
        variant: sharedVariant,
        style: sharedStyle,
        ..._sharedAttrs
    } = sharedAttrs;
    let {
        index,
        label,
        onConfirm,
        variant: uniqueVariant,
        style: uniqueStyle,
        ...uniqueAttrs
    } = data;

    let baseVariant = uniqueVariant ?? sharedVariant ?? "filled";

    let unselectedVariant = baseVariant;
    if (!baseVariant.endsWith("-nohover"))
        unselectedVariant = `${baseVariant}-nohover`;
    const _variant = selected ? "selected" : unselectedVariant;

    return (
        <Button
            variant={_variant}
            color="gray"
            radius={0}
            px="sm"
            style={{
                ...sharedStyle,
                ...uniqueStyle,
            }}
            {..._sharedAttrs}
            {...uniqueAttrs}
            {...{ "data-index": index }}
        >
            {label}
        </Button>
    );
}

const VerticalMenuItem = observer(renderVerticalMenuItem);

const renderVerticalMenu = ({
    data,
    placeholder,
    getSelectedIndex,
    onConfirm,
    stack,
    item,
    ...rest
}: VerticalMenuSettings) => {
    let options: ReactElement[];
    if (data.length) {
        const selectedIndex = getSelectedIndex() ?? null;
        options = data.map((itemData) => (
            <VerticalMenuItem
                key={`${itemData.value}`}
                data={itemData}
                selected={itemData.index == selectedIndex}
                onClick={async (e: SyntheticEvent<HTMLButtonElement>) => {
                    if (onConfirm) onConfirm(e, itemData);
                    else if (itemData.onConfirm) itemData.onConfirm(e);
                }}
                {...item}
            />
        ));
    } else {
        if (placeholder)
            options = [
                <VerticalMenuItem
                    key="null"
                    data={{ index: 0, label: placeholder, disabled: true }}
                />,
            ];
        else options = [];
    }

    return (
        <Paper {...rest}>
            <Stack gap={0} miw={50} {...stack}>
                {options}
            </Stack>
        </Paper>
    );
};

export const VerticalMenu = observer(renderVerticalMenu);

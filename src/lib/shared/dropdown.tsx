import { Button, ButtonProps, ComboboxItem, Paper, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { FunctionComponent, ReactElement } from "react";

interface DropdownItemSettings extends ButtonProps {
    label: string;
    selected?: boolean;
    onClick?: () => void;
}

export interface DropdownSettings {
    data: ComboboxItem[];
    getSelectedIndex: () => number | null;
    confirm?: (item: ComboboxItem) => void;
}

export interface DropdownInterface extends FunctionComponent<DropdownSettings> {
    onKeyDown: (event: KeyboardEvent) => boolean;
}

function renderDropdownItem({
    label,
    selected = false,
    ...rest
}: DropdownItemSettings) {
    let variant = selected ? "light" : "subtle";
    return (
        <Button variant={variant} color="gray" radius="0" {...rest}>
            <span>{label}</span>
        </Button>
    );
}

const DropdownItem = observer(renderDropdownItem);

const renderDropdown = ({
    data,
    getSelectedIndex,
    confirm,
}: DropdownSettings) => {
    const selectedIndex = getSelectedIndex() ?? 0;
    let options: ReactElement[];
    if (data.length)
        options = data.map((item, index) => (
            <DropdownItem
                key={item.value}
                label={item.label}
                selected={index == selectedIndex}
                onClick={() => confirm?.(item)}
            />
        ));
    else
        options = [
            <DropdownItem key="null" label="No results" disabled={true} />,
        ];

    return (
        <Paper>
            <Stack gap={0} miw={50}>
                {options}
            </Stack>
        </Paper>
    );
};

export const Dropdown = observer(renderDropdown) as DropdownInterface;

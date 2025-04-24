import "./table-of-contents.css";

import { Box, Button } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseBoxSettings, BaseButtonSettings } from "@/interface";

export interface TableOfContentsItemData extends BaseButtonSettings {
    label?: string;
    value: any;
    rank: number;
}

export interface TableOfContentsItemSettings extends BaseButtonSettings {
    data: TableOfContentsItemData;
    active: boolean;
}

export interface TableOfContentsSettings extends BaseBoxSettings {
    data: TableOfContentsItemData[];
    activeValue: any;
    itemSettings?: BaseButtonSettings;
}

function renderTableOfContentsItem({
    data,
    active,
    className,
    style: sharedStyle,
    ...sharedRest
}: TableOfContentsItemSettings) {
    const {
        label,
        value,
        rank,
        className: uniqueClassName,
        style: uniqueStyle,
        ...uniqueRest
    } = data;

    let _className = "table-of-contents-item";
    if (uniqueClassName) _className += ` ${uniqueClassName}`;
    else if (className) _className += ` ${className}`;
    if (active) _className += " selected";

    return (
        <Button
            className={_className}
            style={{
                paddingLeft: `calc(${rank} * var(--mantine-spacing-md))`,
                ...sharedStyle,
                ...uniqueStyle,
            }}
            {...sharedRest}
            {...uniqueRest}
        >
            {label ?? value}
        </Button>
    );
}

const TableOfContentsItem = observer(renderTableOfContentsItem);

function renderTableOfContents({
    data,
    activeValue,
    itemSettings,
    ...rest
}: TableOfContentsSettings) {
    return (
        <Box {...rest}>
            {data.map((_data) => (
                <TableOfContentsItem
                    key={`vertical-nav-item-${_data.value}`}
                    data={_data}
                    active={_data.value == activeValue}
                    {...itemSettings}
                />
            ))}
        </Box>
    );
}

export const TableOfContents = observer(renderTableOfContents);

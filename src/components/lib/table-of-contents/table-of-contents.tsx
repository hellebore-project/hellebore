import "./table-of-contents.css";

import { Box, Button } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseBoxProps, BaseButtonProps } from "@/interface";

export interface TableOfContentsItemData extends BaseButtonProps {
    label?: string;
    value: number | string;
    rank: number;
}

export interface TableOfContentsItemProps extends BaseButtonProps {
    data: TableOfContentsItemData;
    active: boolean;
}

export interface TableOfContentsProps extends BaseBoxProps {
    data: TableOfContentsItemData[];
    activeValue: number | string;
    itemProps?: BaseButtonProps;
}

function renderTableOfContentsItem({
    data,
    active,
    className,
    style: sharedStyle,
    ...sharedRest
}: TableOfContentsItemProps) {
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
    itemProps,
    ...rest
}: TableOfContentsProps) {
    return (
        <Box {...rest}>
            {data.map((_data) => (
                <TableOfContentsItem
                    key={`vertical-nav-item-${_data.value}`}
                    data={_data}
                    active={_data.value == activeValue}
                    {...itemProps}
                />
            ))}
        </Box>
    );
}

export const TableOfContents = observer(renderTableOfContents);

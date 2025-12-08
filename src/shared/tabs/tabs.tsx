import "./tabs.css";

import { forwardRef } from "react";
import { Button, Group } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseButtonProps, BaseGroupProps } from "@/interface";

export interface TabData extends BaseButtonProps {
    label: string;
}

export interface TabProps extends BaseButtonProps {
    data: TabData;
    selected: boolean;
}

export interface TabsProps extends BaseGroupProps {
    data: TabData[];
    selectedValue: number | string;
    tabProps?: BaseButtonProps;
}

function renderTab({
    data,
    selected,
    className: sharedClassName = "",
    style: sharedStyle,
    ...rest
}: TabProps) {
    const {
        label,
        className: uniqueClassName,
        style: uniqueStyle,
        ...uniqueRest
    } = data;

    let _className = "tab";
    if (uniqueClassName) _className += ` ${uniqueClassName}`;
    else if (sharedClassName) _className += ` ${sharedClassName}`;
    if (selected) _className += " selected";

    return (
        <Button
            className={_className}
            style={{ ...sharedStyle, ...uniqueStyle }}
            {...rest}
            {...uniqueRest}
        >
            {label}
        </Button>
    );
}

const Tab = observer(renderTab);

const renderTabs = forwardRef<HTMLDivElement, TabsProps>(
    ({ data, selectedValue, className = "", tabProps, ...rest }, ref) => {
        return (
            <Group ref={ref} className={`tabs ${className}`} gap={0} {...rest}>
                {data.map((d) => (
                    <Tab
                        key={`tab-${d.value}`}
                        data={d}
                        selected={d.value === selectedValue}
                        {...tabProps}
                    />
                ))}
            </Group>
        );
    },
);

export const Tabs = observer(renderTabs);

import "./tabs.css";

import { forwardRef } from "react";

import { BaseButtonSettings, BaseGroupSettings } from "@/interface";
import { Button, Group } from "@mantine/core";
import { observer } from "mobx-react-lite";

export interface TabData extends BaseButtonSettings {
    label: string;
}

export interface TabSettings extends BaseButtonSettings {
    data: TabData;
    selected: boolean;
}

export interface TabsSettings extends BaseGroupSettings {
    data: TabData[];
    selectedValue: any;
    tabSettings?: BaseButtonSettings;
}

function renderTab({
    data,
    selected,
    className: sharedClassName = "",
    style: sharedStyle,
    ...rest
}: TabSettings) {
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

const renderTabs = forwardRef<HTMLDivElement, TabsSettings>(
    ({ data, selectedValue, className = "", tabSettings, ...rest }, ref) => {
        return (
            <Group ref={ref} className={`tabs ${className}`} gap={0} {...rest}>
                {data.map((d) => (
                    <Tab
                        key={`tab-${d.value}`}
                        data={d}
                        selected={d.value === selectedValue}
                        {...tabSettings}
                    />
                ))}
            </Group>
        );
    },
);

export const Tabs = observer(renderTabs);

import { Center } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

export const EXPAND_BUTTON_PLACEHOLDER = (
    <div className="nav-item-expand-button-placeholder" />
);

export interface ExpandButtonProps {
    expandable?: boolean;
    expanded?: boolean;
    isExpanded?: () => boolean;
}

function renderExpandButton({
    expanded = false,
    isExpanded,
}: ExpandButtonProps) {
    expanded = isExpanded?.() ?? expanded;
    return (
        <Center>
            <IconChevronRight
                className="nav-sub-item grow-0"
                size={18}
                style={{
                    paddingBlock: "0px",
                    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
            />
        </Center>
    );
}

export const ExpandButton = observer(renderExpandButton);

import "./context-menu.css";

import { observer } from "mobx-react-lite";
import { SyntheticEvent } from "react";

import { getService } from "@/client";
import { OutsideEventHandler } from "@/shared/outside-event-handler";
import {
    VerticalSelection,
    VerticalSelectionData,
} from "@/shared/vertical-selection";

function renderContextMenu() {
    const service = getService();
    const contextMenuService = service.contextMenu;
    if (!contextMenuService.key || !contextMenuService.position) return null;

    const data = contextMenuService.menuData[contextMenuService.key];

    const onConfirm = async (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalSelectionData,
    ) => {
        e.stopPropagation();
        contextMenuService.close();
        await item?.onConfirm?.(e);
    };

    return (
        <OutsideEventHandler
            id="context-menu"
            service={contextMenuService.outsideEvent}
        >
            <VerticalSelection
                className="context-menu-selection"
                left={`${contextMenuService.position.x}px`}
                top={`${contextMenuService.position.y}px`}
                withBorder={true}
                data={data}
                itemSettings={{
                    className: "context-menu-item",
                    variant: "transparent",
                    size: "compact-md",
                    justify: "space-between",
                    onMouseOver: (e) => {
                        contextMenuService.selectedIndex = Number(
                            e.currentTarget.getAttribute("data-index"),
                        );
                    },
                    onMouseLeave: (e) => {
                        const index = Number(
                            e.currentTarget.getAttribute("data-index"),
                        );
                        if (index == contextMenuService.selectedIndex)
                            contextMenuService.selectedIndex = null;
                    },
                }}
                getSelectedIndex={() => contextMenuService.selectedIndex}
                onConfirm={onConfirm}
            />
        </OutsideEventHandler>
    );
}

export const ContextMenu = observer(renderContextMenu);

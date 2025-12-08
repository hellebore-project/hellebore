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
    const service = getService().contextMenu;
    if (!service.visible || !service.menu) return null;

    const itemData = service.menu.itemData;

    const onConfirm = async (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalSelectionData,
    ) => {
        e.stopPropagation();
        service.close();
        await item?.onConfirm?.(e);
    };

    return (
        <OutsideEventHandler id="context-menu" service={service.outsideEvent}>
            <VerticalSelection
                className="context-menu-selection"
                left={`${service.position.x}px`}
                top={`${service.position.y}px`}
                withBorder={true}
                data={itemData}
                itemProps={{
                    className: "context-menu-item",
                    variant: "transparent",
                    size: "compact-md",
                    justify: "space-between",
                    onMouseOver: (e) => {
                        service.selectedIndex = Number(
                            e.currentTarget.getAttribute("data-index"),
                        );
                    },
                    onMouseLeave: (e) => {
                        const index = Number(
                            e.currentTarget.getAttribute("data-index"),
                        );
                        if (index == service.selectedIndex)
                            service.selectedIndex = null;
                    },
                }}
                getSelectedIndex={() => service.selectedIndex}
                onConfirm={onConfirm}
            />
        </OutsideEventHandler>
    );
}

export const ContextMenu = observer(renderContextMenu);

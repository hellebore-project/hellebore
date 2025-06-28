import "./context-menu.css";

import { observer } from "mobx-react-lite";
import { SyntheticEvent } from "react";

import { VerticalSelectionData } from "@/interface";
import { getService } from "src/services";
import { OutsideClickHandler } from "src/shared/outside-click-handler";
import { VerticalSelection } from "src/shared/vertical-selection";

function renderContextMenu() {
    const service = getService();
    const contextMenuService = service.view.contextMenu;
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
        <OutsideClickHandler
            id="context-menu"
            service={contextMenuService.outsideClickHandler}
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
        </OutsideClickHandler>
    );
}

export const ContextMenu = observer(renderContextMenu);

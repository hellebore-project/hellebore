import { observer } from "mobx-react-lite";

import { VerticalMenuItemData } from "@/interface";
import { getService } from "@/services";
import { VerticalMenu } from "@/shared/vertical-menu";
import { SyntheticEvent } from "react";
import { OutsideClickHandler } from "./shared/outside-click-handler";

function renderContextMenu() {
    const service = getService();
    const contextMenuService = service.view.contextMenu;
    if (!contextMenuService.key || !contextMenuService.position) return null;

    const data = contextMenuService.menuData[contextMenuService.key];

    const onConfirm = async (
        e: SyntheticEvent<HTMLButtonElement>,
        item: VerticalMenuItemData,
    ) => {
        e.stopPropagation();
        contextMenuService.close();
        await item?.onConfirm?.(e);
    };

    return (
        <OutsideClickHandler
            display="block"
            state={contextMenuService.outsideClickHandlerState}
        >
            <VerticalMenu
                left={`${contextMenuService.position.x}px`}
                top={`${contextMenuService.position.y}px`}
                display="block"
                withBorder={true}
                autoFocus={true}
                style={{
                    position: "absolute",
                    zIndex: "var(--mantine-z-index-overlay)",
                }}
                data={data}
                item={{
                    variant: "transparent",
                    size: "compact-md",
                    justify: "space-between",
                    m: 3,
                    style: {
                        minWidth: 300,
                    },
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

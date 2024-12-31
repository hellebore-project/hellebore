import { observer } from "mobx-react-lite";

import { ContextMenuKey } from "@/interface";
import { getService } from "@/services";
import { VerticalMenu, VerticalMenuItemData } from "@/shared/vertical-menu";
import { SyntheticEvent } from "react";
import { OutsideClickHandler } from "./shared/outside-click-handler";
import { AppService } from "./services/app-service";

type ContextMenuDataMapping = {
    [key in ContextMenuKey]?: VerticalMenuItemData[];
};
let CONTEXT_MENU_DATA_MAPPING: ContextMenuDataMapping | null = null;

function formatData(data: Partial<VerticalMenuItemData>[]) {
    return data.map((d, i) => ({ index: i, ...d })) as VerticalMenuItemData[];
}

function generateDataMapping(service: AppService) {
    const NAV_BAR_FOLDER_NODE_DATA = formatData([
        {
            label: "Delete",
            onConfirm: () => {
                const id = service.view.contextMenu.articleNavigator
                    .id as number;
                return new Promise(() => service.view.openFolderRemover(id));
            },
        },
    ]);

    CONTEXT_MENU_DATA_MAPPING = {
        [ContextMenuKey.NAV_BAR_FOLDER_NODE]: NAV_BAR_FOLDER_NODE_DATA,
    };
    return CONTEXT_MENU_DATA_MAPPING;
}

function renderContextMenu() {
    const service = getService();
    const contextMenuService = service.view.contextMenu;
    if (!contextMenuService.key || !contextMenuService.position) return null;

    const mapping = CONTEXT_MENU_DATA_MAPPING ?? generateDataMapping(service);
    const data = mapping?.[contextMenuService.key] as VerticalMenuItemData[];

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
            state={contextMenuService.outsideClickHandlerState}
            display="block"
        >
            <VerticalMenu
                data={data}
                getSelectedIndex={() => contextMenuService.selectedIndex}
                onConfirm={onConfirm}
                left={`${contextMenuService.position.x}px`}
                top={`${contextMenuService.position.y}px`}
                display="block"
                withBorder={true}
                autoFocus={true}
                style={{
                    position: "absolute",
                    zIndex: 101,
                }}
                item={{
                    variant: "transparent",
                    m: 3,
                    size: "compact-md",
                    justify: "space-between",
                    style: {
                        minWidth: 300,
                    },
                    onMouseOver: (e) => {
                        console.log("mousing over item");
                        contextMenuService.selectedIndex = Number(
                            e.currentTarget.getAttribute("index"),
                        );
                    },
                    onMouseLeave: (e) => {
                        const index = Number(
                            e.currentTarget.getAttribute("index"),
                        );
                        if (index == contextMenuService.selectedIndex)
                            contextMenuService.selectedIndex = null;
                    },
                }}
            />
        </OutsideClickHandler>
    );
}

export const ContextMenu = observer(renderContextMenu);

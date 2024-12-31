import { ActionIcon } from "@mantine/core";
import { IconLibraryMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { NavSubItem } from "@/shared/nav-item/nav-item";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderCollapseFolderButton() {
    const service = getService();
    return (
        <NavSubItem span="content" p="0">
            <ToolTipWrapper label="Collapse All Folders">
                <ActionIcon
                    key="collapse-folders"
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={(e) => {
                        console.log("");
                        e.stopPropagation(); // don't toggle the expanded status of the tab
                        const articleNavService = service.view.navigation.files;
                        // NOTE: the `closeAll` function can't be called inside a service
                        articleNavService.tree?.current?.closeAll();
                    }}
                >
                    <IconLibraryMinus size={18} />
                </ActionIcon>
            </ToolTipWrapper>
        </NavSubItem>
    );
}

export const CollapseFoldersButton = observer(renderCollapseFolderButton);

import { ActionIcon } from "@mantine/core";
import { IconFolderPlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderAddFolderButton() {
    const service = getService();
    return (
        <ToolTipWrapper className="nav-sub-item compact" label="New Folder">
            <ActionIcon
                key="add-folder"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    const fileNav = service.navigation.files;
                    const node = fileNav.addPlaceholderNodeForNewFolder();
                    // the parent folder needs to be open
                    // NOTE: the `open` function can't be called inside a service
                    fileNav.tree?.current?.open(node.parent);
                }}
            >
                <IconFolderPlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddFolderButton = observer(renderAddFolderButton);

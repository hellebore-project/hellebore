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
                    service.navigation.files.onClickAddFolderButton();
                }}
            >
                <IconFolderPlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddFolderButton = observer(renderAddFolderButton);

import { ActionIcon } from "@mantine/core";
import { IconFolderPlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "src/services";
import { ToolTipWrapper } from "src/shared/tool-tip";

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
                    const articleNavService = service.view.navigation.files;
                    const node =
                        articleNavService.addPlaceholderNodeForNewFolder();
                    // the parent folder needs to be open
                    // NOTE: the `open` function can't be called inside a service
                    articleNavService.tree?.current?.open(node.parent);
                }}
            >
                <IconFolderPlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddFolderButton = observer(renderAddFolderButton);

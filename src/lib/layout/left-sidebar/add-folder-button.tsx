import { ActionIcon } from "@mantine/core";
import { IconFolderPlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { MouseEvent } from "react";

import { getService } from "@/services";
import { NavSubItem } from "@/shared/nav-item/nav-item";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderAddFolderButton() {
    const service = getService();
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
        const articleNavService = service.view.navigation.articles;
        const node = articleNavService.addPlaceholderNodeForNewFolder();
        // the parent folder needs to be open
        // NOTE: the `open` function can't be called inside a service
        articleNavService.tree?.current?.open(node.parent);
    };
    return (
        <NavSubItem span="content" p="0">
            <ToolTipWrapper label="New Folder">
                <ActionIcon
                    key="add-folder"
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={onClick}
                >
                    <IconFolderPlus size={18} />
                </ActionIcon>
            </ToolTipWrapper>
        </NavSubItem>
    );
}

export const AddFolderButton = observer(renderAddFolderButton);

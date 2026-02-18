import { ActionIcon } from "@mantine/core";
import { IconFolderPlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { ToolTipWrapper } from "@/components/react/lib/tool-tip";

import { SpotlightService } from "../spotlight.service";

interface AddFolderButtonProps {
    service: SpotlightService;
}

function renderAddFolderButton({ service }: AddFolderButtonProps) {
    return (
        <ToolTipWrapper
            className="nav-sub-item grow-0"
            label="New Folder"
            portalProps={{ target: service.fetchPortalSelector.produce() }}
        >
            <ActionIcon
                key="add-folder"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    service.onClickAddFolderButton();
                }}
            >
                <IconFolderPlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddFolderButton = observer(renderAddFolderButton);

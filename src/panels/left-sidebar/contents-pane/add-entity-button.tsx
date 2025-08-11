import { ActionIcon } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderAddEntityButton() {
    const service = getService();
    return (
        <ToolTipWrapper className="nav-sub-item compact" label="New Entity">
            <ActionIcon
                key="add-entity"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    service.view.openEntityCreator({
                        folderId: service.view.navigation.files.activeFolderId,
                    });
                }}
            >
                <IconFilePlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddEntityButton = observer(renderAddEntityButton);

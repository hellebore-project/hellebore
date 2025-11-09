import { ActionIcon } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderAddEntryButton() {
    const service = getService();
    return (
        <ToolTipWrapper className="nav-sub-item compact" label="New Entry">
            <ActionIcon
                key="add-entry"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    service.navigation.files.onClickAddEntryButton();
                }}
            >
                <IconFilePlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddEntryButton = observer(renderAddEntryButton);

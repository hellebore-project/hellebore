import { ActionIcon } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { SpotlightService } from "@/client/services";
import { ToolTipWrapper } from "@/shared/tool-tip";

interface AddEntryButtonProps {
    service: SpotlightService;
}

function renderAddEntryButton({ service }: AddEntryButtonProps) {
    return (
        <ToolTipWrapper
            className="nav-sub-item compact"
            label="New Entry"
            portalProps={{ target: service.fetchPortalSelector.produceOne() }}
        >
            <ActionIcon
                key="add-entry"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    service.onClickAddEntryButton();
                }}
            >
                <IconFilePlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddEntryButton = observer(renderAddEntryButton);

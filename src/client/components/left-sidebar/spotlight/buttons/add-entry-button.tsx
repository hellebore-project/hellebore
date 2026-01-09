import { ActionIcon } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { ToolTipWrapper } from "@/components/tool-tip";

import { SpotlightService } from "../spotlight.service";

interface AddEntryButtonProps {
    service: SpotlightService;
}

function renderAddEntryButton({ service }: AddEntryButtonProps) {
    return (
        <ToolTipWrapper
            className="nav-sub-item compact"
            label="New Entry"
            portalProps={{ target: service.fetchPortalSelector.produce() }}
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

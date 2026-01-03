import { ActionIcon } from "@mantine/core";
import { IconLibraryMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { SpotlightService } from "@/client/services";
import { ToolTipWrapper } from "@/shared/tool-tip";

interface CollapseFoldersButtonProps {
    service: SpotlightService;
}

function renderCollapseFolderButton({ service }: CollapseFoldersButtonProps) {
    return (
        <ToolTipWrapper
            className="nav-sub-item compact"
            label="Collapse All Folders"
            portalProps={{ target: service.fetchPortalSelector.produceOne() }}
        >
            <ActionIcon
                key="collapse-folders"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    service.collapseNodes();
                }}
            >
                <IconLibraryMinus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const CollapseFoldersButton = observer(renderCollapseFolderButton);

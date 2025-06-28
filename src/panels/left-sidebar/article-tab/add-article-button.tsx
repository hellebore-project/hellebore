import { ActionIcon } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "src/services";
import { ToolTipWrapper } from "src/shared/tool-tip";

function renderAddArticleButton() {
    const service = getService();
    return (
        <ToolTipWrapper className="nav-sub-item compact" label="New Article">
            <ActionIcon
                key="add-article"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation(); // don't toggle the expanded status of the tab
                    service.view.openEntityCreator();
                }}
            >
                <IconFilePlus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const AddArticleButton = observer(renderAddArticleButton);

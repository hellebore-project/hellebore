import { ActionIcon } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { MouseEvent } from "react";

import { getService } from "@/services";
import { NavSubItem } from "@/shared/nav-item/nav-item";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderAddArticleButton() {
    const service = getService();
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
        service.view.openArticleCreator();
    };
    return (
        <NavSubItem span="content" p="0">
            <ToolTipWrapper label="New Article">
                <ActionIcon
                    key="add-article"
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={onClick}
                >
                    <IconFilePlus size={18} />
                </ActionIcon>
            </ToolTipWrapper>
        </NavSubItem>
    );
}

export const AddArticleButton = observer(renderAddArticleButton);

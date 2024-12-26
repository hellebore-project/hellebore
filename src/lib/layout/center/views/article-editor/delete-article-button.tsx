import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { MouseEvent } from "react";

import { getService } from "@/services";
import { NavSubItem } from "@/shared/nav-item";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderDeleteArticleButton() {
    const service = getService();
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
        service.view.openArticleRemover(service.view.articleEditor.info.id);
    };
    return (
        <NavSubItem span="content" p="0">
            <ToolTipWrapper label="Delete Article">
                <ActionIcon
                    key="delete-article"
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={onClick}
                >
                    <IconTrash size={18} />
                </ActionIcon>
            </ToolTipWrapper>
        </NavSubItem>
    );
}

export const DeleteArticleButton = observer(renderDeleteArticleButton);

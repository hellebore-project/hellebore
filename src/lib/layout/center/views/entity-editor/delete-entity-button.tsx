import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { NavSubItem } from "@/shared/nav-item";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderDeleteEntityButton() {
    const service = getService();
    const onClick = () => {
        service.view.deleteEntity(service.view.entityEditor.info.id);
    };
    return (
        <NavSubItem span="content" p="0">
            <ToolTipWrapper label="Delete Entity">
                <ActionIcon
                    key="delete-entity"
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

export const DeleteEntityButton = observer(renderDeleteEntityButton);

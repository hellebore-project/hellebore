import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderDeleteEntityButton() {
    const info = getService().view.entityEditor.info;
    const onClick = () => {
        info.view.deleteEntity(info.id, info.title);
    };
    return (
        <ToolTipWrapper className="compact" label="Delete Entity">
            <ActionIcon
                key="delete-entity-button"
                variant="subtle"
                color="red"
                size="sm"
                onClick={onClick}
            >
                <IconTrash size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const DeleteEntityButton = observer(renderDeleteEntityButton);

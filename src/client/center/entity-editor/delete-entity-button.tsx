import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderDeleteEntityButton() {
    const client = getService();
    const info = client.entityEditor.info;
    const onClick = () => {
        client.deleteEntity(info.id, info.title);
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

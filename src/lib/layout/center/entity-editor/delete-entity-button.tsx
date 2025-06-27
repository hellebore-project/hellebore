import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderDeleteEntityButton() {
    const service = getService();
    const onClick = () => {
        service.view.deleteEntity(service.view.entityEditor.info.id);
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

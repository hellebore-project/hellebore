import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

function renderDeleteEntryButton() {
    const client = getService();
    const info = client.entryEditor.info;
    const onClick = () => {
        client.deleteEntry(info.id, info.title);
    };

    return (
        <ToolTipWrapper className="compact" label="Delete Entity">
            <ActionIcon
                key="delete-entry-button"
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

export const DeleteEntryButton = observer(renderDeleteEntryButton);

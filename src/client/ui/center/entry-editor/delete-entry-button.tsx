import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { EntryEditor, getService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

interface DeleteEntryButtonSettings {
    service: EntryEditor;
}

function renderDeleteEntryButton({ service }: DeleteEntryButtonSettings) {
    const client = getService();
    const info = service.info;
    const onClick = () => {
        // TODO: move this logic to the entry-editor service
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

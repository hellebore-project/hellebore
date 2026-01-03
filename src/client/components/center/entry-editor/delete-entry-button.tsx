import { ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { EntryEditorService } from "@/client";
import { ToolTipWrapper } from "@/shared/tool-tip";

interface DeleteEntryButtonProps {
    service: EntryEditorService;
}

function renderDeleteEntryButton({ service }: DeleteEntryButtonProps) {
    return (
        <ToolTipWrapper
            className="compact"
            label="Delete Entity"
            portalProps={{ target: service.fetchPortalSelector.produceOne() }}
        >
            <ActionIcon
                key="delete-entry-button"
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => service.deleteEntry()}
            >
                <IconTrash size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

export const DeleteEntryButton = observer(renderDeleteEntryButton);

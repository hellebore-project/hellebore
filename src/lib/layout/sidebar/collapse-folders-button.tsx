import { ActionIcon } from "@mantine/core";
import { IconLibraryMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { MouseEvent } from "react";

import { getService } from "../../services";
import { NavSubItem } from "../../shared/nav-item/nav-item";

function renderCollapseFolderButton() {
    const service = getService();
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
        const articleNavService = service.view.navigation.articles;
        // NOTE: the `closeAll` function can't be called inside a service
        articleNavService.tree?.current?.closeAll();
    };
    return (
        <NavSubItem span="content" p="0">
            <ActionIcon
                key="add-folder"
                variant="subtle"
                color="gray"
                size="sm"
                onClick={onClick}
            >
                <IconLibraryMinus size={18} />
            </ActionIcon>
        </NavSubItem>
    );
}

export const CollapseFoldersButton = observer(renderCollapseFolderButton);

import "./contents-pane.css";

import { Collapse } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { NavItem } from "@/shared/nav-item";
import { OutsideEventHandler } from "@/shared/outside-event-handler";

import { AddEntryButton } from "./add-entry-button";
import { CollapseFoldersButton } from "./collapse-folders-button";
import { AddFolderButton } from "./add-folder-button";
import { FileNavigator } from "./file-navigator";

function renderContentsPaneHeader() {
    const fileNav = getService().navigation.files;
    return (
        <NavItem
            groupSettings={{
                onClick: () => fileNav.toggleExpanded(),
            }}
            expandButtonSettings={{
                expandable: true,
                isExpanded: () => fileNav.expanded,
            }}
            textSettings={{
                text: "CONTENTS",
                textSettings: { fw: 500 },
            }}
        >
            {fileNav.canAddEntity && <AddEntryButton />}
            {fileNav.canAddFolder && <AddFolderButton />}
            {fileNav.canCollapseAllFolders && <CollapseFoldersButton />}
        </NavItem>
    );
}

const ContentsPaneHeader = observer(renderContentsPaneHeader);

function renderContentsPane() {
    const service = getService();
    const fileNav = service.navigation.files;
    // the components have to take up as much vertical space as possible in order to allow
    // dragging nodes to the top level of the file tree
    return (
        <OutsideEventHandler
            className="contents-pane"
            service={fileNav.outsideEventHandler}
            onClick={() => {
                fileNav.selectedNode = null;
                fileNav.focused = true;
            }}
            onMouseEnter={() => (fileNav.hover = true)}
            onMouseLeave={() => (fileNav.hover = false)}
        >
            <ContentsPaneHeader />
            <Collapse
                h="100%"
                in={fileNav.expanded}
                transitionDuration={50}
                transitionTimingFunction="linear"
            >
                <FileNavigator />
            </Collapse>
        </OutsideEventHandler>
    );
}

export const ContentsPane = observer(renderContentsPane);

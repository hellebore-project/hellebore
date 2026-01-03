import "./spotlight.css";

import { Collapse } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { SpotlightService } from "@/client/components";
import { NavItem } from "@/shared/nav-item";
import { OutsideEventHandler } from "@/shared/outside-event-handler";

import { AddEntryButton } from "./add-entry-button";
import { CollapseFoldersButton } from "./collapse-folders-button";
import { AddFolderButton } from "./add-folder-button";
import { FileNavigator } from "./file-navigator";

interface SpotlightProps {
    service: SpotlightService;
}

function renderSpotlightHeader({ service }: SpotlightProps) {
    return (
        <NavItem
            groupProps={{
                onClick: () => service.toggleExpanded(),
            }}
            expandButtonProps={{
                expandable: true,
                isExpanded: () => service.expanded,
            }}
            textProps={{
                text: "SPOTLIGHT",
                textProps: { fw: 500 },
            }}
        >
            {service.canAddEntity && <AddEntryButton service={service} />}
            {service.canAddFolder && <AddFolderButton service={service} />}
            {service.canCollapseAllFolders && (
                <CollapseFoldersButton service={service} />
            )}
        </NavItem>
    );
}

const SpotlightHeader = observer(renderSpotlightHeader);

function renderSpotlight({ service }: SpotlightProps) {
    // the components have to take up as much vertical space as possible in order to allow
    // dragging nodes to the top level of the file tree
    return (
        <OutsideEventHandler
            className="spotlight"
            service={service.outsideEvent}
            onClick={() => {
                service.selectedNode = null;
                service.focused = true;
            }}
            onMouseEnter={() => (service.hover = true)}
            onMouseLeave={() => (service.hover = false)}
        >
            <SpotlightHeader service={service} />
            <Collapse
                h="100%"
                in={service.expanded}
                transitionDuration={50}
                transitionTimingFunction="linear"
            >
                <FileNavigator service={service} />
            </Collapse>
        </OutsideEventHandler>
    );
}

export const Spotlight = observer(renderSpotlight);

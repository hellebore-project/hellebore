import "./left-sidebar.css";

import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { NavigationService } from "@/client/services";

import { Spotlight } from "./spotlight";

interface LeftSideBarProps {
    service: NavigationService;
}

function renderLeftSideBar({ service }: LeftSideBarProps) {
    // the components have to take up as much vertical space as possible in order to allow
    // dragging nodes to the top level of the file tree
    return (
        <Container className="left-sidebar" fluid>
            <Spotlight service={service.spotlight} />
        </Container>
    );
}

export const LeftSideBar = observer(renderLeftSideBar);

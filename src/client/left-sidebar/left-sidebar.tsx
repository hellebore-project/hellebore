import "./left-sidebar.css";

import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ContentsPane } from "./contents-pane";

function renderLeftSideBar() {
    // the components have to take up as much vertical space as possible in order to allow
    // dragging nodes to the top level of the file tree
    return (
        <Container className="left-sidebar" fluid>
            <ContentsPane />
        </Container>
    );
}

export const LeftSideBar = observer(renderLeftSideBar);

import "./left-sidebar.css";

import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ArticlesTab } from "./article-tab";

function renderLeftSideBar() {
    // the components have to take up as much vertical space as possible in order to allow
    // dragging article nodes to the top level of the file tree
    return (
        <Container className="left-sidebar" fluid>
            <ArticlesTab />
        </Container>
    );
}

export const LeftSideBar = observer(renderLeftSideBar);

import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ArticlesTab } from "./article-tab";

function renderSideBar() {
    // the components have to take up as much vertical space as possible in order to allow
    // dragging article nodes to the top level of the file tree
    return (
        <Container fluid mx={0} px={0} py={4} h="100%">
            <ArticlesTab />
        </Container>
    );
}

export const SideBar = observer(renderSideBar);

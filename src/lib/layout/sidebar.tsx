import { Container } from "@mantine/core";
import { observer } from "mobx-react-lite";

import ArticleNavigator from "../views/article-navigator";

function renderSideBar() {
    return (
        <Container fluid ml={0} mr={0}>
            <ArticleNavigator />
        </Container>
    );
}

export const SideBar = observer(renderSideBar);

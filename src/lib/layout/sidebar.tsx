import { ActionIcon, Box, Collapse, Container, Space } from "@mantine/core";
import { IconFolderPlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { MouseEvent } from "react";

import { getService } from "../services";
import { NavItem, NavSubItem } from "../shared/nav-item/nav-item";
import { ArticleNavigator } from "../views/article-navigator";

function renderAddFolderButton() {
    const service = getService();
    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
        const articleNavService = service.view.navigation.articles;
        const node = articleNavService.addPlaceholderNodeForNewFolder();
        // the parent folder needs to be open
        // NOTE: the `open` function can't be called inside a service
        articleNavService.tree?.current?.open(node.parent);
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
                <IconFolderPlus size={18} />
            </ActionIcon>
        </NavSubItem>
    );
}

const AddFolderButton = observer(renderAddFolderButton);

function renderArticlesHeader() {
    const service = getService();
    return (
        <NavItem
            textSettings={{
                fw: 500,
                value: "ARTICLES",
            }}
            expandButtonSettings={{
                expandable: true,
                isExpanded: () => service.view.navigation.articles.expanded,
            }}
            onClick={() => service.view.navigation.articles.toggleExpanded()}
        >
            {service.view.navigation.articles.canAddFolder && (
                <AddFolderButton />
            )}
        </NavItem>
    );
}

const ArticlesHeader = observer(renderArticlesHeader);

function renderSideBar() {
    const service = getService();
    // the components have to take up as much vertical space as possible in order to allow
    // dragging article nodes to the top level of the file tree
    return (
        <Container fluid mx={0} px={0} py={4} h="100%">
            <Box
                h="100%"
                onMouseEnter={() =>
                    service.view.navigation.articles.setHover(true)
                }
                onMouseLeave={() =>
                    service.view.navigation.articles.setHover(false)
                }
            >
                <ArticlesHeader />
                <Space h="sm" />
                <Collapse
                    h="100%"
                    in={service.view.navigation.articles.expanded}
                    transitionDuration={50}
                    transitionTimingFunction="linear"
                    onClick={() =>
                        service.view.navigation.articles.setSelectedNode(null)
                    }
                >
                    <ArticleNavigator />
                </Collapse>
            </Box>
        </Container>
    );
}

export const SideBar = observer(renderSideBar);

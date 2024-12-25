import { Box, Collapse, Space } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { NavItem } from "@/shared/nav-item/nav-item";
import { ArticleNavigator } from "../center/views/article-navigator";
import { AddFolderButton } from "./add-folder-button";
import { CollapseFoldersButton } from "./collapse-folders-button";
import { AddArticleButton } from "./add-article-button";

function renderArticlesTabHeader() {
    const articleNavService = getService().view.navigation.articles;
    return (
        <NavItem
            textSettings={{
                fw: 500,
                value: "ARTICLES",
            }}
            expandButtonSettings={{
                expandable: true,
                isExpanded: () => articleNavService.expanded,
            }}
            onClick={() => articleNavService.toggleExpanded()}
        >
            {articleNavService.canAddArticle && <AddArticleButton />}
            {articleNavService.canAddFolder && <AddFolderButton />}
            {articleNavService.canCollapseAllFolders && (
                <CollapseFoldersButton />
            )}
        </NavItem>
    );
}

const ArticlesTabHeader = observer(renderArticlesTabHeader);

function renderArticlesTab() {
    const service = getService();
    // the components have to take up as much vertical space as possible in order to allow
    // dragging article nodes to the top level of the file tree
    return (
        <Box
            h="100%"
            onMouseEnter={() => service.view.navigation.articles.setHover(true)}
            onMouseLeave={() =>
                service.view.navigation.articles.setHover(false)
            }
        >
            <ArticlesTabHeader />
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
    );
}

export const ArticlesTab = observer(renderArticlesTab);

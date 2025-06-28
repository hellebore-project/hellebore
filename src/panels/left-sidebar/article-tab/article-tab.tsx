import { Box, Collapse } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "src/services";
import { NavItem } from "src/shared/nav-item/nav-item";
import { FileNavigator } from "./file-navigator";
import { AddFolderButton } from "./add-folder-button";
import { CollapseFoldersButton } from "./collapse-folders-button";
import { AddArticleButton } from "./add-article-button";

function renderArticlesTabHeader() {
    const articleNavService = getService().view.navigation.files;
    return (
        <NavItem
            groupSettings={{
                onClick: () => articleNavService.toggleExpanded(),
            }}
            expandButtonSettings={{
                expandable: true,
                isExpanded: () => articleNavService.expanded,
            }}
            textSettings={{
                text: "ARTICLES",
                textSettings: { fw: 500 },
            }}
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
    const fileNav = service.view.navigation.files;
    // the components have to take up as much vertical space as possible in order to allow
    // dragging article nodes to the top level of the file tree
    return (
        <Box
            h="100%"
            onMouseEnter={() => (fileNav.hover = true)}
            onMouseLeave={() => (fileNav.hover = false)}
        >
            <ArticlesTabHeader />
            <Collapse
                h="100%"
                in={fileNav.expanded}
                transitionDuration={50}
                transitionTimingFunction="linear"
            >
                <FileNavigator />
            </Collapse>
        </Box>
    );
}

export const ArticlesTab = observer(renderArticlesTab);

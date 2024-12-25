import { Burger, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntityType } from "@/interface";
import { getService } from "@/services";
import { MenuButton } from "@/shared/menu-button";
import { DIVIDER, MenuDropdown } from "@/shared/menu-dropdown";
import { HEADER_HEIGHT } from "@/constants";

const FLEX_STYLE = { paddingLeft: 15 };

function renderSideBarToggleButton() {
    const service = getService();
    return (
        <Burger
            opened={service.view.sideBarOpen}
            onClick={() => service.view.toggleSideBar()}
            hiddenFrom="sm"
            size="sm"
        />
    );
}

const SideBarToggleButton = observer(renderSideBarToggleButton);

function renderHeader() {
    const service = getService();
    return (
        <Flex
            mih={HEADER_HEIGHT}
            gap={0}
            justify="flex-start"
            align="center"
            direction="row"
            wrap="nowrap"
            style={FLEX_STYLE}
        >
            <SideBarToggleButton />
            <MenuButton label="Home" onClick={() => service.view.openHome()} />
            <MenuDropdown
                label="App"
                elements={[
                    {
                        label: "New Project",
                        onClick: () => service.view.openProjectCreator(),
                    },
                    {
                        label: "Open Project",
                        onClick: () => service.view.loadProject(),
                    },
                    DIVIDER,
                    {
                        label: "Settings",
                        onClick: () => service.view.openSettings(),
                    },
                ]}
            />
            <MenuDropdown
                label="Encyclopedia"
                elements={[
                    {
                        label: "New Article",
                        onClick: () => service.view.openArticleCreator(),
                    },
                ]}
            />
            <MenuDropdown
                label="Dictionary"
                elements={[
                    {
                        label: "New Language",
                        onClick: () =>
                            service.view.openArticleCreator(
                                EntityType.LANGUAGE,
                            ),
                    },
                    {
                        label: "New Word",
                        onClick: () =>
                            service.view.openArticleCreator(EntityType.WORD),
                    },
                ]}
            />
        </Flex>
    );
}

export const Header = observer(renderHeader);

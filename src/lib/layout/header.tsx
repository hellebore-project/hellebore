import { Burger, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntityType } from "@/interface";
import { getService } from "@/services";
import { MenuButton } from "@/shared/menu-button";
import { MenuDropdown } from "@/shared/menu-dropdown";

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
            mih={50}
            gap="md"
            justify="flex-start"
            align="center"
            direction="row"
            wrap="nowrap"
            style={FLEX_STYLE}
        >
            <SideBarToggleButton />
            <MenuButton label="Home" onClick={() => service.view.openHome()} />
            <MenuDropdown
                label="Encyclopedia"
                items={[
                    {
                        label: "New Article",
                        onClick: () => service.view.openArticleCreator(),
                    },
                ]}
            />
            <MenuDropdown
                label="Dictionary"
                items={[
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
            <MenuButton
                label="Settings"
                onClick={() => service.view.openSettings()}
            />
        </Flex>
    );
}

export const Header = observer(renderHeader);

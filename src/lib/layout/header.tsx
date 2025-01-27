import { Burger, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { BaseButtonSettings, EntityType } from "@/interface";
import { getService } from "@/services";
import { MenuButton } from "@/shared/menu-button";
import {
    DIVIDER_DATA,
    MenuDropdown,
    MenuDropdownElementData,
} from "@/shared/menu-dropdown";
import { HEADER_BG_COLOR, HEADER_HEIGHT } from "@/constants";
import { ThemeManager } from "@/theme";

const FLEX_STYLE = { paddingLeft: 8 };
const MENU_BUTTON_SETTINGS = {
    variant: "filled-hover",
    c: "white",
    bg: HEADER_BG_COLOR,
};

function renderNavBarMobileToggleButton() {
    const service = getService();
    return (
        <Burger
            opened={service.view.navBarMobileOpen}
            onClick={() => service.view.toggleNavBar()}
            hiddenFrom="sm"
            size="sm"
            pr="8"
        />
    );
}

const NavBarMobileToggleButton = observer(renderNavBarMobileToggleButton);

function renderAppMenuDropdown() {
    const service = getService();

    const newProjectButtonData = {
        label: "New Project",
        onClick: () => service.view.openProjectCreator(),
    };
    const openProjectButtonData = {
        label: "Open Project",
        onClick: () => service.view.loadProject(),
    };
    const closeProjectButtonData = {
        label: "Close Project",
        onClick: () => service.view.closeProject(),
    };
    const settingsButtonData = {
        label: "Settings",
        onClick: () => service.view.openSettings(),
    };

    let elements: MenuDropdownElementData[];
    if (service.domain.hasProject)
        elements = [
            newProjectButtonData,
            openProjectButtonData,
            closeProjectButtonData,
            DIVIDER_DATA,
            settingsButtonData,
        ];
    else
        elements = [
            newProjectButtonData,
            openProjectButtonData,
            DIVIDER_DATA,
            settingsButtonData,
        ];

    return (
        <MenuDropdown
            label="App"
            elements={elements}
            button={{
                ...ThemeManager.applyVariantToButtonStyle<BaseButtonSettings>(
                    MENU_BUTTON_SETTINGS,
                ),
            }}
        />
    );
}

export const AppMenuDropdown = observer(renderAppMenuDropdown);

function renderEncyclopediaMenuDropdown() {
    const service = getService();
    return (
        <MenuDropdown
            label="Encyclopedia"
            elements={[
                {
                    label: "New Article",
                    onClick: () => service.view.openArticleCreator(),
                },
                DIVIDER_DATA,
                {
                    label: "Search",
                    onClick: () => {
                        /* TODO */
                    },
                },
            ]}
            button={{
                ...ThemeManager.applyVariantToButtonStyle<BaseButtonSettings>(
                    MENU_BUTTON_SETTINGS,
                ),
            }}
        />
    );
}

export const EncyclopediaMenuDropdown = observer(
    renderEncyclopediaMenuDropdown,
);

function renderDictionaryMenuDropdown() {
    const service = getService();
    return (
        <MenuDropdown
            label="Dictionary"
            elements={[
                {
                    label: "New Language",
                    onClick: () =>
                        service.view.openArticleCreator(EntityType.LANGUAGE),
                },
                {
                    label: "New Word",
                    onClick: () =>
                        service.view.openArticleCreator(EntityType.WORD),
                },
                DIVIDER_DATA,
                {
                    label: "Search",
                    onClick: () => {
                        /* TODO */
                    },
                },
                {
                    label: "Translate",
                    onClick: () => {
                        /* TODO */
                    },
                },
            ]}
            button={ThemeManager.applyVariantToButtonStyle<BaseButtonSettings>(
                MENU_BUTTON_SETTINGS,
            )}
        />
    );
}

export const DictionaryMenuDropdown = observer(renderDictionaryMenuDropdown);

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
            <NavBarMobileToggleButton />
            <MenuButton
                label="Home"
                onClick={() => service.view.openHome()}
                {...ThemeManager.applyVariantToButtonStyle<BaseButtonSettings>(
                    MENU_BUTTON_SETTINGS,
                )}
            />
            <AppMenuDropdown />
            {service.domain.hasProject && <EncyclopediaMenuDropdown />}
            {service.domain.hasProject && <DictionaryMenuDropdown />}
        </Flex>
    );
}

export const Header = observer(renderHeader);

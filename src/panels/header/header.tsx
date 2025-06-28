import "./header.css";

import { Burger, Button, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntityType } from "@/interface";
import { getService } from "src/services";
import {
    DIVIDER_DATA,
    MenuDropdown,
    MenuDropdownElementData,
} from "src/shared/menu-dropdown";

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

    return <MenuDropdown label="App" data={elements} />;
}

export const AppMenuDropdown = observer(renderAppMenuDropdown);

function renderEncyclopediaMenuDropdown() {
    const service = getService();
    return (
        <MenuDropdown
            label="Encyclopedia"
            data={[
                {
                    label: "New Article",
                    onClick: () => service.view.openEntityCreator(),
                },
                DIVIDER_DATA,
                {
                    label: "Search",
                    onClick: () => {
                        /* TODO */
                    },
                },
            ]}
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
            data={[
                {
                    label: "New Language",
                    onClick: () =>
                        service.view.openEntityCreator(EntityType.LANGUAGE),
                },
                {
                    label: "New Word",
                    onClick: () =>
                        service.view.openEntityCreator(EntityType.WORD),
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
        />
    );
}

export const DictionaryMenuDropdown = observer(renderDictionaryMenuDropdown);

function renderHeader() {
    const service = getService();
    return (
        <Flex
            className="header"
            gap={0}
            justify="flex-start"
            align="center"
            direction="row"
            wrap="nowrap"
        >
            <NavBarMobileToggleButton />
            <Button
                className="menu-button"
                size="compact-sm"
                onClick={() => service.view.openHome()}
            >
                Home
            </Button>
            <AppMenuDropdown />
            {service.domain.hasProject && <EncyclopediaMenuDropdown />}
            {service.domain.hasProject && <DictionaryMenuDropdown />}
        </Flex>
    );
}

export const Header = observer(renderHeader);

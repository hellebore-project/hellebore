import "./header.css";

import { Burger, Button, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { MenuDropdown } from "@/shared/menu-dropdown";

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

function renderHomeButton() {
    const service = getService();
    return (
        <Button
            className="menu-button"
            size="compact-sm"
            onClick={() => service.view.openHome()}
        >
            Home
        </Button>
    );
}
export const HomeButton = observer(renderHomeButton);

function renderFileMenuDropdown() {
    const service = getService();
    const data = service.view.header.getFileMenuData();
    return <MenuDropdown label="File" data={data} />;
}
export const FileMenuDropdown = observer(renderFileMenuDropdown);

function renderHeader() {
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
            <HomeButton />
            <FileMenuDropdown />
        </Flex>
    );
}
export const Header = observer(renderHeader);

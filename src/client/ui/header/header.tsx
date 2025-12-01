import "./header.css";

import { Burger, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { MenuButton } from "@/shared/menu-button";
import { MenuDropdown } from "@/shared/menu-dropdown";

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
            <Burger
                opened={service.navigation.mobileOpen}
                onClick={() => service.navigation.toggleMobileOpen()}
                hiddenFrom="sm"
                size="sm"
                pr="8"
            />
            <MenuButton
                label="Home"
                onClick={() => service.central.openHome()}
            />
            <MenuDropdown
                label="File"
                data={service.header.getFileMenuData()}
            />
        </Flex>
    );
}
export const Header = observer(renderHeader);

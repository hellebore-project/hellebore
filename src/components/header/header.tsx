import "./header.css";

import { Burger, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { MenuButton } from "@/components/lib/menu-button";
import { MenuDropdown } from "@/components/lib/menu-dropdown";

import { HeaderManager } from "./header.service";
import { EntrySearchField } from "../shared/entry-search-field";

interface HeaderProps {
    service: HeaderManager;
}

function renderHeader({ service }: HeaderProps) {
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
                opened={service.fetchLeftBarStatus.produce()}
                onClick={() => service.onToggleLeftBar.produce()}
                hiddenFrom="sm"
                size="sm"
                pr="8"
            />
            <MenuButton
                label="Home"
                onClick={() => service.onOpenHome.produce()}
            />
            <MenuDropdown
                label="File"
                data={service.fileMenuData}
                portalProps={{
                    target: service.fetchPortalSelector.produce(),
                }}
            />
            <div className="grow" />
            <EntrySearchField service={service.entrySearch} />
        </Flex>
    );
}
export const Header = observer(renderHeader);

import "./header.css";

import { Burger, Flex } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { HeaderManager } from "@/client/services";
import { MenuButton } from "@/shared/menu-button";
import { MenuDropdown } from "@/shared/menu-dropdown";
import { SearchField } from "@/shared/search-field";

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
                opened={service.fetchLeftBarStatus.produceOne()}
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
                    target: service.fetchPortalSelector.produceOne(),
                }}
            />
            <div className="grow" />
            <SearchField
                onValueChange={(value) =>
                    service.selectEntrySearchResult(value)
                }
                getSearch={() => service.searchQuery}
                onSearchChange={(value) => (service.searchQuery = value)}
                getData={() => service.searchData}
                textProps={{ className: "header-search" }}
                portalProps={{
                    target: service.fetchPortalSelector.produceOne(),
                }}
            />
        </Flex>
    );
}
export const Header = observer(renderHeader);

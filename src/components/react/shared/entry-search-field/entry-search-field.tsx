import "./entry-search-field.css";

import { observer } from "mobx-react-lite";

import { SearchField } from "@/components/react/lib/search-field";

import { EntrySearchService } from "./entry-search-field.service";

interface EntrySearchProps {
    service: EntrySearchService;
}

function renderEntrySearchField({ service }: EntrySearchProps) {
    return (
        <SearchField
            onValueChange={(value) => service.selectEntrySearchResult(value)}
            getSearch={() => service.searchQuery}
            onSearchChange={(value) => (service.searchQuery = value)}
            getData={() => service.searchData}
            textProps={{ className: "entry-search" }}
            portalProps={{
                target: service.fetchPortalSelector.produce(),
            }}
        />
    );
}

export const EntrySearchField = observer(renderEntrySearchField);

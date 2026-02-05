import "./entry-search-field.css";

import { observer } from "mobx-react-lite";

import { SearchField } from "@/components/lib/combo-field";

import { EntrySearchService } from "./entry-search-field.service";

interface EntrySearchProps {
    service: EntrySearchService;
}

function renderEntrySearchField({ service }: EntrySearchProps) {
    return (
        <SearchField
            service={service.search}
            inputProps={{
                className: "entry-search",
                getValue: () => service.searchQuery,
                onValueChange: (value) => (service.searchQuery = value),
            }}
            dropdownProps={{
                getData: () => service.searchData,
                onValueChange: (value) =>
                    service.selectEntrySearchResult(value),
                portalProps: {
                    target: service.fetchPortalSelector.produce(),
                },
            }}
        />
    );
}

export const EntrySearchField = observer(renderEntrySearchField);

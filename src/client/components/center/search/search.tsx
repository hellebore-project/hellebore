import { Box, Title } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { DIVIDER, SPACE } from "@/shared/common";

import { SearchService } from "./search.service";
import { EntrySearchField } from "../../shared/entry-search-field";

interface SearchProps {
    service: SearchService;
}

function renderSearch({ service }: SearchProps) {
    return (
        <Box className="search">
            <Title order={1}>Search Results</Title>
            {DIVIDER}
            {SPACE}
            <EntrySearchField service={service.entrySearch} />
        </Box>
    );
}

export const Search = observer(renderSearch);

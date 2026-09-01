import { EntrySearchService } from "@/ui/shared/entry-search";

import { test as baseTest } from "../../fixtures";

interface EntrySearchFixtures {
    entrySearchService: EntrySearchService;
}

export const test = baseTest.extend<EntrySearchFixtures>({
    entrySearchService: async (
        { domainManager, clientData, mockedEntries },
        use,
    ) => {
        const service = new EntrySearchService(domainManager, clientData);
        service.queryPeriod = 0;
        use(service);
    },
});

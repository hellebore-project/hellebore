import { DomainManager } from "@/api";
import type { HeaderManager } from "@/ui/header";
import { HeaderManager as StandaloneHeaderManager } from "@/ui/header/header-service.svelte";
import { test as baseTest } from "@tests/unit/ui/fixtures";

interface HeaderFixtures {
    headerManager: HeaderManager;
    standaloneHeaderManager: HeaderManager;
}

export const test = baseTest.extend<HeaderFixtures>({
    headerManager: async ({ mockedSearchedEntries, clientManager }, use) => {
        use(clientManager.header);
    },

    standaloneHeaderManager: async ({}, use) => {
        use(new StandaloneHeaderManager(new DomainManager()));
    },
});

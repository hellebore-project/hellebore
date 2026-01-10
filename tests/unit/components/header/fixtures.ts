import { HeaderManager } from "@/components";
import { test as baseTest } from "@tests/unit/components/fixtures";

interface HeaderFixtures {
    headerManager: HeaderManager;
}

export const test = baseTest.extend<HeaderFixtures>({
    // services
    headerManager: async ({ mockedSearchedEntries, clientManager }, use) => {
        use(clientManager.header);
    },
});

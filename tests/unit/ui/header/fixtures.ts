import type { HeaderManager } from "@/ui/header";
import { test as baseTest } from "@tests/unit/ui/fixtures";

interface HeaderFixtures {
    headerManager: HeaderManager;
}

export const test = baseTest.extend<HeaderFixtures>({
    headerManager: async ({ mockedSearchedEntries, clientManager }, use) => {
        use(clientManager.header);
    },
});

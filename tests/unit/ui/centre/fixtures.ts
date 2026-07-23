import type { CentralPanelManager } from "@/ui/centre";

import { test as baseTest } from "../fixtures";

export interface BaseCentreFixtures {
    centralPanelManager: CentralPanelManager;
}

export const test = baseTest.extend<BaseCentreFixtures>({
    centralPanelManager: async ({ clientManager }, use) => {
        await use(clientManager.central);
    },
});

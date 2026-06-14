import type { LeftSidebarService } from "@/ui/left-sidebar";
import { LeftSidebarService as StandaloneLeftSidebarService } from "@/ui/left-sidebar/left-sidebar-service.svelte";
import { test as baseTest } from "@tests/unit/ui/fixtures";

interface LeftSidebarFixtures {
    leftSidebar: LeftSidebarService;
    standaloneLeftSidebar: LeftSidebarService;
}

export const test = baseTest.extend<LeftSidebarFixtures>({
    leftSidebar: async ({ clientManager }, use) => {
        use(clientManager.leftSideBar);
    },
    standaloneLeftSidebar: async ({ domainManager }, use) => {
        use(new StandaloneLeftSidebarService({ domain: domainManager }));
    },
});

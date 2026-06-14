import type { FooterManager } from "@/ui/footer";
import { FooterManager as StandaloneFooterManager } from "@/ui/footer/footer-service.svelte";
import { test as baseTest } from "@tests/unit/ui/fixtures";

interface FooterFixtures {
    footerManager: FooterManager;
    standaloneFooterManager: FooterManager;
}

export const test = baseTest.extend<FooterFixtures>({
    footerManager: async ({ clientManager }, use) => {
        use(clientManager.footer);
    },
    standaloneFooterManager: async ({ domainManager }, use) => {
        use(new StandaloneFooterManager(domainManager));
    },
});

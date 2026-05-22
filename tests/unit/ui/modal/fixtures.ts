import type {
    EntryCreatorService,
    ModalManager,
    ProjectCreatorService,
} from "@/ui/modal";
import { EntryCreatorService as StandaloneEntryCreatorService } from "@/ui/modal/entry-creator/entry-creator-service.svelte";
import { ModalManager as StandaloneModalManager } from "@/ui/modal/modal-service.svelte";
import { ProjectCreatorService as StandaloneProjectCreatorService } from "@/ui/modal/project-creator/project-creator-service.svelte";
import { test as baseTest } from "@tests/unit/ui/fixtures";

interface ModalFixtures {
    modalManager: ModalManager;
    standaloneModalManager: ModalManager;
    projectCreatorService: ProjectCreatorService;
    entryCreatorService: EntryCreatorService;
}

export const test = baseTest.extend<ModalFixtures>({
    modalManager: async ({ clientManager }, use) => {
        use(clientManager.modal);
    },
    standaloneModalManager: async ({}, use) => {
        use(new StandaloneModalManager());
    },
    projectCreatorService: async ({}, use) => {
        use(new StandaloneProjectCreatorService());
    },
    entryCreatorService: async ({}, use) => {
        use(new StandaloneEntryCreatorService());
    },
});

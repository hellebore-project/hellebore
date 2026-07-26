import type {
    EntryCreatorService,
    ModalManager,
    ProjectCreatorService,
} from "@/ui/modal";

import { test as baseTest } from "../fixtures";

interface ModalFixtures {
    modalManager: ModalManager;
    projectCreatorService: ProjectCreatorService;
    entryCreatorService: EntryCreatorService;
}

export const test = baseTest.extend<ModalFixtures>({
    modalManager: async ({ clientManager }, use) => {
        use(clientManager.modal);
    },
    projectCreatorService: async ({ modalManager }, use) => {
        use(modalManager.openProjectCreator());
    },
    entryCreatorService: async ({ modalManager, entryType, folderId }, use) => {
        use(modalManager.openEntryCreator({ entryType, folderId }));
    },
});

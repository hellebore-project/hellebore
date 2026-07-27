import { EntryType } from "@/api";
import { OpenEntryCreatorEvent } from "@/interface";
import type {
    EntryCreatorService,
    ModalManager,
    ProjectCreatorService,
} from "@/ui/modal";

import { test as baseTest } from "../fixtures";

interface ModalFixtures {
    folderId?: string;
    entryType?: EntryType;
    modalManager: ModalManager;
    projectCreatorService: ProjectCreatorService;
    entryCreatorService: EntryCreatorService;
}

export const test = baseTest.extend<ModalFixtures>({
    folderId: undefined,
    entryType: undefined,
    modalManager: async ({ clientManager }, use) => {
        use(clientManager.modal);
    },
    projectCreatorService: async ({ modalManager }, use) => {
        use(modalManager.openProjectCreator());
    },
    entryCreatorService: async ({ modalManager, entryType, folderId }, use) => {
        const event: OpenEntryCreatorEvent = {
            entryType,
            folderId,
        };
        use(modalManager.openEntryCreator({ entryType, folderId }));
    },
});

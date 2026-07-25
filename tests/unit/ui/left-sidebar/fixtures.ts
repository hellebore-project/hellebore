import { EntryViewType, SidebarSectionType } from "@/constants";
import type {
    EntryEditorNavigatorService,
    EntrySpotlightService,
    LeftSidebarService,
} from "@/ui/left-sidebar";
import { test as baseTest } from "@tests/unit/ui/fixtures";

interface LeftSidebarFixtures {
    leftSidebarService: LeftSidebarService;
    entrySpotlightService: EntrySpotlightService;
    entryEditorNavigatorService: EntryEditorNavigatorService;
}

export const test = baseTest.extend<LeftSidebarFixtures>({
    leftSidebarService: async ({ clientManager }, use) => {
        use(clientManager.leftSideBar);
    },
    entrySpotlightService: async ({ leftSidebarService }, use) => {
        const type = SidebarSectionType.EntrySpotlight;
        const service = leftSidebarService.getSectionByType(
            type,
        ) as EntrySpotlightService;
        await use(service);
    },
    entryEditorNavigatorService: async (
        { clientManager, leftSidebarService, entryId, entryType, entryTitle },
        use,
    ) => {
        const service = leftSidebarService.addEntryEditorNavigator({
            ownerId: clientManager.id,
            entry: { id: entryId, type: entryType, title: entryTitle },
            activeView: EntryViewType.ArticleEditor,
        });
        await use(service);
    },
});

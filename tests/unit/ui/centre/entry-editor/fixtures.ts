import { EntryViewType } from "@/constants";
import { EntryEditorService, EntryInfoService } from "@/ui/centre/entry-editor";

import { test as baseTest } from "../fixtures";

export interface BaseEntryEditorFixtures {
    entryViewType: EntryViewType;
    entryEditorMocks: null;
    entryEditorService: EntryEditorService;
    entryInfoService: EntryInfoService;
}

export const test = baseTest.extend<BaseEntryEditorFixtures>({
    entryViewType: EntryViewType.ArticleEditor,
    entryEditorMocks: async (
        { mockedEntryArticle, mockedSearchedEntries },
        use,
    ) => {
        // inject the required mocks for the entry-editor service to work.
        // by default, use the required article-editor mocks.
        // override as needed.
        await use(null);
    },
    entryEditorService: [
        async (
            { clientManager, entryViewType, entryId, entryEditorMocks },
            use,
        ) => {
            const service = await clientManager.central.openEntryEditor({
                id: entryId,
                viewKey: entryViewType,
            });
            await use(service);
        },
        { auto: true },
    ],
    entryInfoService: async ({ entryEditorService }, use) => {
        await use(entryEditorService.info);
    },
});

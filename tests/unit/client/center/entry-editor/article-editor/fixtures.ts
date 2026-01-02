import { EntryViewType, ArticleEditorService } from "@/client";

import { test as baseTest } from "../fixtures";

export interface BasePropertyEditorFixtures {
    articleEditorService: ArticleEditorService;
}

export const test = baseTest.extend<BasePropertyEditorFixtures>({
    // services
    articleEditorService: [
        async (
            {
                clientManager,
                entryId,
                mockedEntryArticle,
                mockedSearchedEntries,
            },
            use,
        ) => {
            const service = await clientManager.central.openEntryEditor({
                id: entryId,
                viewKey: EntryViewType.ArticleEditor,
            });
            await use(service.article);
        },
        { auto: true },
    ],
});

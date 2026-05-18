import type { ArticleEditorService } from "@/ui/centre/entry-editor/article-editor";
import { EntryViewType } from "@/constants";

import { test as baseTest } from "../fixtures";

export interface BaseArticleEditorFixtures {
    articleEditorService: ArticleEditorService;
}

export const test = baseTest.extend<BaseArticleEditorFixtures>({
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

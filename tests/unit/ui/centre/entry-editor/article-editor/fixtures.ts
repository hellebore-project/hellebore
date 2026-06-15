import { EntryViewType } from "@/constants";
import { Id } from "@/interface";
import { EntryType, ROOT_FOLDER_ID, type EntryInfoResponse } from "@/api";
import type { ArticleEditorService } from "@/ui/centre/entry-editor/article-editor";

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

export const referencedEntryId: Id = "entry2";
export const referencedEntryTitle = "mocked-referenced-entry";
export const referencedEntryInfo: EntryInfoResponse = {
    id: referencedEntryId,
    folderId: ROOT_FOLDER_ID,
    entityType: EntryType.Person,
    title: referencedEntryTitle,
};

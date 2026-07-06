import { EntryViewType } from "@/constants";
import { Id } from "@/interface";
import { EntryType, ROOT_FOLDER_ID, type EntryInfoResponse } from "@/api";
import type { ArticleEditorService } from "@/ui/centre/entry-editor/article-editor";

import { test as baseTest } from "../fixtures";

export interface BaseArticleEditorFixtures {
    referencedEntryId: Id;
    referencedEntryTitle: string;
    referencedEntryInfo: EntryInfoResponse;
    articleEditorService: ArticleEditorService;
}

export const test = baseTest
    .extend<BaseArticleEditorFixtures>({
        referencedEntryId: "entry2",
        referencedEntryTitle: "mocked-referenced-entry",
        referencedEntryInfo: async (
            { referencedEntryId, referencedEntryTitle },
            use,
        ) => {
            const entryInfo: EntryInfoResponse = {
                id: referencedEntryId,
                folderId: ROOT_FOLDER_ID,
                entityType: EntryType.Person,
                title: referencedEntryTitle,
            };
            await use(entryInfo);
        },
        articleEditorService: async ({ entryEditorService }, use) => {
            await use(entryEditorService.article);
        },
    })
    .override({
        otherEntries: async ({ referencedEntryInfo }, use) =>
            await use([referencedEntryInfo]),
    });

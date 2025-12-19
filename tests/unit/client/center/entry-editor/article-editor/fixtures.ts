import { JSONContent } from "@tiptap/core";

import { EntryViewType, ArticleEditorService } from "@/client";
import { EntryArticleResponse, EntryInfoResponse } from "@/domain";
import { Id } from "@/interface";
import {
    mockGetEntryArticle,
    createDocNode,
    createParagraphNode,
    createTextNode,
    mockSearchEntries,
} from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BasePropertyEditorFixtures {
    entryArticleText: string;
    entryArticle: JSONContent;
    mockedEntryArticle: EntryArticleResponse;
    mockedSearchedEntries: EntryInfoResponse[];
    articleEditorService: ArticleEditorService;
}

export const test = baseTest.extend<BasePropertyEditorFixtures>({
    // data
    entryArticleText: "mocked article text",
    entryArticle: async ({ entryArticleText }, use) => {
        const articleContent = createDocNode([
            createParagraphNode([createTextNode(entryArticleText)]),
        ]);
        use(articleContent);
    },

    // mocking
    mockedEntryArticle: async (
        { mockedInvoker, mockedEntryInfo, entryArticle },
        use,
    ) => {
        const entryWithArticle: EntryArticleResponse = {
            info: mockedEntryInfo,
            text: JSON.stringify(entryArticle),
        };
        mockGetEntryArticle(mockedInvoker, entryWithArticle);
        use(entryWithArticle);
    },
    mockedSearchedEntries: async ({ mockedInvoker, allEntries }, use) => {
        mockSearchEntries(mockedInvoker, allEntries);
        use(allEntries);
    },

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

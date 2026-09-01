import { EntryViewType } from "@/constants";
import type { Id } from "@/interface";
import { EntryType, type WordResponse, WordType } from "@/api";
import type {
    WordEditorService,
    WordTableService,
} from "@/ui/centre/entry-editor/word-editor";
import { mockListWords } from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BaseWordEditorFixtures {
    mockedWord: WordResponse;
    mockedWords: WordResponse[];
    wordEditorService: WordEditorService;
    wordTableService: WordTableService;
}

export const test = baseTest
    .extend<BaseWordEditorFixtures>({
        mockedWord: async ({ mockedWords }, use) => {
            await use(mockedWords[0]);
        },
        mockedWords: async ({ mockedInvoker, words }, use) => {
            mockListWords(mockedInvoker, words);
            await use(words);
        },

        wordEditorService: async ({ entryEditorService }, use) => {
            await use(entryEditorService.lexicon);
        },
        wordTableService: async ({ wordEditorService }, use) => {
            await use(wordEditorService.table);
        },
    })
    .override({
        entryType: EntryType.Language,
        entryViewType: EntryViewType.WordEditor,
        entryEditorMocks: async (
            { mockedEntryInfo, mockedWord, mockedWords },
            use,
        ) => {
            await use(null);
        },
    });

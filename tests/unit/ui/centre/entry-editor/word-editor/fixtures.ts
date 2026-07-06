import { EntryViewType } from "@/constants";
import type { Id } from "@/interface";
import { EntryType, type WordResponse, WordType } from "@/api";
import type { WordEditorService } from "@/ui/centre/entry-editor/word-editor";
import { mockGetWords } from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BaseWordEditorFixtures {
    entryType: EntryType.Language;
    wordId: Id;
    wordType: WordType;
    wordSpelling: string;
    wordDefinition: string;
    wordTranslations: string[];
    word: WordResponse;
    mockedWord: WordResponse;
    wordEditorService: WordEditorService;
}

export const test = baseTest
    .extend<BaseWordEditorFixtures>({
        entryType: EntryType.Language,

        wordId: "word1",
        wordType: WordType.Noun,
        wordSpelling: "test-word",
        wordDefinition: "test-definition",
        wordTranslations: ["translation1"],
        word: async (
            {
                entryId,
                wordId,
                wordType,
                wordSpelling,
                wordDefinition,
                wordTranslations,
            },
            use,
        ) => {
            const word: WordResponse = {
                id: wordId,
                languageId: entryId,
                wordType,
                spelling: wordSpelling,
                definition: wordDefinition,
                translations: wordTranslations,
            };
            await use(word);
        },
        mockedWord: async ({ mockedInvoker, word }, use) => {
            mockGetWords(mockedInvoker, [word]);
            await use(word);
        },

        wordEditorService: async ({ entryEditorService }, use) => {
            await use(entryEditorService.lexicon);
        },
    })
    .override({
        entryViewType: EntryViewType.WordEditor,
        entryEditorMocks: async ({ mockedEntryInfo, mockedWord }, use) => {
            await use(null);
        },
    });

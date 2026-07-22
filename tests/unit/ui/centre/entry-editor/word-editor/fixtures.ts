import { EntryViewType } from "@/constants";
import type { Id } from "@/interface";
import { EntryType, type WordResponse, WordType } from "@/api";
import type {
    WordEditorService,
    WordTableService,
} from "@/ui/centre/entry-editor/word-editor";
import { mockGetWords } from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BaseWordEditorFixtures {
    entryType: EntryType.Language;
    languageId: Id;
    wordId: Id;
    wordType: WordType;
    wordSpelling: string;
    wordDefinition: string;
    wordTranslations: string[];
    word: WordResponse;
    words: WordResponse[];
    mockedWord: WordResponse;
    mockedWords: WordResponse[];
    wordEditorService: WordEditorService;
    wordTableService: WordTableService;
}

export const test = baseTest
    .extend<BaseWordEditorFixtures>({
        entryType: EntryType.Language,

        languageId: async ({ entryId }, use) => await use(entryId),

        wordId: "word1",
        wordType: WordType.Noun,
        wordSpelling: "alpha",
        wordDefinition: "first",
        wordTranslations: ["one", "single"],
        word: async (
            {
                languageId,
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
                languageId,
                wordType,
                spelling: wordSpelling,
                definition: wordDefinition,
                translations: wordTranslations,
            };
            await use(word);
        },
        words: async ({ word }, use) => {
            await use([word]);
        },

        mockedWord: async ({ mockedWords }, use) => {
            await use(mockedWords[0]);
        },
        mockedWords: async ({ mockedInvoker, words }, use) => {
            mockGetWords(mockedInvoker, words);
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
        entryViewType: EntryViewType.WordEditor,
        entryEditorMocks: async (
            { mockedEntryInfo, mockedWord, mockedWords },
            use,
        ) => {
            await use(null);
        },
    });

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
    words: WordResponse[];
    mockedWord: WordResponse;
    mockedWords: WordResponse[];
    wordEditorService: WordEditorService;
}

export const test = baseTest.extend<BaseWordEditorFixtures>({
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
    words: async ({ word }, use) => {
        await use([word]);
    },
    mockedWords: async ({ mockedInvoker, words }, use) => {
        mockGetWords(mockedInvoker, words);
        await use(words);
    },
    mockedWord: async ({ mockedWords }, use) => {
        await use(mockedWords[0]);
    },

    wordEditorService: [
        async (
            { clientManager, entryId, mockedEntryInfo, mockedWord },
            use,
        ) => {
            const service = await clientManager.central.openEntryEditor({
                id: entryId,
                viewKey: EntryViewType.WordEditor,
            });
            await use(service.lexicon);
        },
        { auto: true },
    ],
});

import { EntryViewType, WordEditorService } from "@/client";
import { EntityType, WordResponse, WordType } from "@/domain";
import { Id } from "@/interface";
import { mockGetWords } from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BaseWordEditorFixtures {
    wordId: Id;
    wordType: WordType;
    wordSpelling: string;
    wordDefinition: string;
    wordTranslations: string[];
    word: WordResponse;
    mockedWord: WordResponse;
    wordEditorService: WordEditorService;
}

export const test = baseTest.extend<BaseWordEditorFixtures>({
    // data
    wordId: 1,
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
        const word = {
            id: wordId,
            language_id: entryId,
            word_type: wordType,
            spelling: wordSpelling,
            definition: wordDefinition,
            translations: wordTranslations,
        };
        use(word);
    },
    mockedWord: async ({ mockedInvoker, mockedEntryInfo, word }, use) => {
        mockGetWords(mockedInvoker, [word]);
        use(word);
    },

    // services
    wordEditorService: [
        async ({ clientManager, entryId, wordType }, use) => {
            const service = await clientManager.central.openEntryEditor({
                id: entryId,
                viewKey: EntryViewType.WordEditor,
                wordType,
            });
            await use(service.lexicon);
        },
        { auto: true },
    ],
});

test.scoped({ entryType: EntityType.LANGUAGE });

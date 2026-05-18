import { EntryType, EntryViewType, WordType } from "@/constants";
import type { Id, WordResponse } from "@/interface";
import type { WordEditorService } from "@/ui/centre/entry-editor/word-editor";
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
    entryType: EntryType.Language,

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
        const word: WordResponse = {
            id: wordId,
            languageId: entryId,
            wordType,
            spelling: wordSpelling,
            definition: wordDefinition,
            translations: wordTranslations,
        };
        use(word);
    },
    mockedWord: async ({ mockedInvoker, word }, use) => {
        mockGetWords(mockedInvoker, [word]);
        use(word);
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

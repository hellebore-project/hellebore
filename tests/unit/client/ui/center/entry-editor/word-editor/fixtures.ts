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
            mockedInvoker,
            entry,
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
            language_id: entry.id,
            word_type: wordType,
            spelling: wordSpelling,
            definition: wordDefinition,
            translations: wordTranslations,
        };
        mockGetWords(mockedInvoker, [word]);
        use(word);
    },

    // services
    wordEditorService: [
        async ({ clientManager, entryId, wordType }, use) => {
            const entryEditorService =
                await clientManager.central.openEntryEditor({
                    id: entryId,
                    viewKey: EntryViewType.WordEditor,
                    wordType,
                });

            await use(entryEditorService.lexicon);
        },
        { auto: true },
    ],
});

test.scoped({ entryType: EntityType.LANGUAGE });

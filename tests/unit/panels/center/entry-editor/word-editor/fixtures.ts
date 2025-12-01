import { EntryViewType, WordEditor } from "@/client";
import { WordType } from "@/domain/constants";
import { test as baseTest } from "@tests/unit/panels/center/entry-editor/fixtures";

export interface BaseWordEditorFixtures {
    wordType: WordType;
    wordEditorService: WordEditor;
}

export const test = baseTest.extend<BaseWordEditorFixtures>({
    // data
    wordType: [WordType.Noun, { injected: true }],

    // services
    wordEditorService: [
        async ({ service, entryId, wordType }, use) => {
            const entryEditorService = await service.central.openEntryEditor({
                id: entryId,
                viewKey: EntryViewType.WordEditor,
                wordType,
            });

            await use(entryEditorService.lexicon);
        },
        { auto: true },
    ],
});

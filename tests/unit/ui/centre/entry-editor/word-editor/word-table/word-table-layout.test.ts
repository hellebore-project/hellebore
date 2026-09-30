import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { WordTable } from "@/ui/centre/entry-editor/word-editor/word-table";
import { render } from "@tests/utils";

import { test } from "../fixtures";
import { WordType } from "@/api";

test("renders table with correct columns", async ({ wordEditorService }) => {
    render(WordTable, { props: { service: wordEditorService.table } });

    screen.getByText("Type");
    screen.getByText("Spelling");
    screen.getByText("Definition");
    screen.getByText("Translations");
});

test.extend({
    word: async ({ languageId }, use) => {
        await use({
            id: "word1",
            languageId: languageId,
            wordType: WordType.Noun,
            spelling: "alpha",
            definition: "first",
            translations: ["one", "single"],
        });
    },
})("renders row", async ({ wordEditorService, mockedWord }) => {
    render(WordTable, { props: { service: wordEditorService.table } });

    screen.getByText("alpha");
    screen.getByText("first");
    screen.getByText("one, single");
});

test("adds a row through the empty-table placeholder", async ({
    user,
    wordEditorService,
}) => {
    const tableService = wordEditorService.table.table;
    tableService.reset();

    render(WordTable, { props: { service: wordEditorService.table } });
    await user.click(screen.getByRole("button", { name: "Add Row" }));

    expect(tableService.rows).toHaveLength(1);
    expect(tableService.rows[0].cells.wordType.value).toBe(
        String(WordType.RootWord),
    );
});

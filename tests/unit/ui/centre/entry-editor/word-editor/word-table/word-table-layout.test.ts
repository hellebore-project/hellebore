import { screen, within } from "@testing-library/svelte";
import { expect } from "vitest";

import { WordTable } from "@/ui/centre/entry-editor/word-editor/word-table";
import { render } from "@tests/utils";
import { mockDeleteWord } from "@tests/utils/mocks";

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

test("inserts a row above the selected word", async ({
    user,
    wordEditorService,
}) => {
    const wordTable = wordEditorService.table;
    const tableService = wordTable.table;
    const targetKey = tableService.rows[0].key;
    const targetSpelling = tableService.rows[0].cells.spelling.value;

    render(WordTable, { props: { service: wordTable } });

    const targetRow = screen.getByText(targetSpelling).closest("tr")!;
    await user.hover(targetRow);
    await user.click(
        within(targetRow).getByRole("button", { name: "Insert Row Above" }),
    );

    const rowKeys = tableService.rows.map((row) => row.key);
    const targetIndex = rowKeys.indexOf(targetKey);
    expect(targetIndex).toBeGreaterThan(0);
    expect(rowKeys[targetIndex - 1]).not.toBe(targetKey);
});

test("inserts a row below the selected word", async ({
    user,
    wordEditorService,
}) => {
    const wordTable = wordEditorService.table;
    const tableService = wordTable.table;
    const targetKey = tableService.rows[0].key;
    const targetSpelling = tableService.rows[0].cells.spelling.value;

    render(WordTable, { props: { service: wordTable } });

    const targetRow = screen.getByText(targetSpelling).closest("tr")!;
    await user.hover(targetRow);
    await user.click(
        within(targetRow).getByRole("button", { name: "Insert Row Below" }),
    );

    const rowKeys = tableService.rows.map((row) => row.key);
    const targetIndex = rowKeys.indexOf(targetKey);
    expect(targetIndex).toBeLessThan(rowKeys.length - 1);
    expect(rowKeys[targetIndex + 1]).not.toBe(targetKey);
});

test("removes a row through its delete action", async ({
    user,
    mockedInvoker,
    wordEditorService,
}) => {
    mockDeleteWord(mockedInvoker);

    const wordTable = wordEditorService.table;
    const tableService = wordTable.table;
    const target = tableService.rows[0];
    const spelling = target.cells.spelling.value;

    render(WordTable, { props: { service: wordTable } });

    const targetRow = screen.getByText(spelling).closest("tr")!;
    await user.hover(targetRow);
    await user.click(
        within(targetRow).getByRole("button", { name: "Delete Row" }),
    );

    expect(tableService.findRow(target.key)).toBeUndefined();
    expect(screen.queryByText(spelling)).toBeNull();
});

import { expect, describe } from "vitest";

import { WordColumnKey } from "@/ui/centre/entry-editor/word-editor/word-table";
import { WordTable } from "@/ui/centre/entry-editor/word-editor/word-table";
import { render } from "@tests/utils";
import { mockDeleteWord } from "@tests/utils/mocks";

import { test } from "../fixtures";

describe("cell selection", () => {
    test("clicking a cell selects only that cell", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.handleCellMouseDown(
            new MouseEvent("mousedown"),
            "word1",
            WordColumnKey.Spelling,
        );

        expect(table.selectedCells.has("word1-spelling")).toBe(true);
        expect(table.selectedCells.has("word1-translations")).toBe(false);

        table.handleCellMouseDown(
            new MouseEvent("mousedown"),
            "word1",
            WordColumnKey.Translations,
        );

        expect(table.selectedCells.has("word1-translations")).toBe(true);
        expect(table.selectedCells.has("word1-spelling")).toBe(false);
    });

    test("ctrl+click adds to selection and makes it active", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.handleCellMouseDown(
            new MouseEvent("mousedown"),
            "word1",
            WordColumnKey.Spelling,
        );
        table.endDrag();

        table.handleCellMouseDown(
            new MouseEvent("mousedown", { ctrlKey: true }),
            "word1",
            WordColumnKey.Translations,
        );

        expect(table.selectedCells.has("word1-spelling")).toBe(true);
        expect(table.selectedCells.has("word1-translations")).toBe(true);
        expect(table.activeCell).toStrictEqual({
            rowKey: "word1",
            colKey: WordColumnKey.Translations,
        });
    });

    test("shift+click selects a range", async ({ wordEditorService }) => {
        const table = wordEditorService.table.table;
        table.handleCellMouseDown(
            new MouseEvent("mousedown"),
            "word1",
            WordColumnKey.Spelling,
        );
        table.endDrag();

        table.handleCellMouseDown(
            new MouseEvent("mousedown", { shiftKey: true }),
            "word1",
            WordColumnKey.Translations,
        );

        expect(table.selectedCells.has("word1-spelling")).toBe(true);
        expect(table.selectedCells.has("word1-definition")).toBe(true);
        expect(table.selectedCells.has("word1-translations")).toBe(true);
    });

    test("dragging from one cell to another selects a rectangle", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.startDrag("word1", WordColumnKey.Spelling);
        table.dragTo("word1", WordColumnKey.Translations);
        table.endDrag();

        expect(table.selectedCells.has("word1-spelling")).toBe(true);
        expect(table.selectedCells.has("word1-definition")).toBe(true);
        expect(table.selectedCells.has("word1-translations")).toBe(true);
    });

    test("clicking outside deselects all cells", async ({
        user,
        wordEditorService,
    }) => {
        render(WordTable, { props: { service: wordEditorService.table } });

        wordEditorService.table.table.selectSingle(
            "word1",
            WordColumnKey.Spelling,
        );
        expect(wordEditorService.table.table.selectedCells.size).toBe(1);

        document.body.appendChild(document.createElement("div"));
        const outside = document.body.lastElementChild as HTMLDivElement;
        outside.setAttribute("data-testid", "outside");

        await user.click(outside);
        expect(wordEditorService.table.table.selectedCells.size).toBe(0);
    });
});

describe("cell editing", () => {
    test("can edit a text cell", async ({ wordEditorService }) => {
        const table = wordEditorService.table.table;
        table.handleCellMouseDown(
            new MouseEvent("mousedown"),
            "word1",
            WordColumnKey.Spelling,
        );
        table.endDrag();

        table.startEdit("word1", WordColumnKey.Spelling);
        table.setValue("word1", WordColumnKey.Spelling, "edited");
        table.commitEdit();

        const rowData = table.findRow("word1");
        if (!rowData) throw new Error("Row data not found");

        expect(rowData.cells[WordColumnKey.Spelling].value).toBe("edited");
    });
});

test("can delete a row", async ({ mockedInvoker, wordEditorService }) => {
    mockDeleteWord(mockedInvoker);

    const key = "word1";
    const row = wordEditorService.table.table.findRow(key);
    if (!row) throw new Error("Word row not found");

    await wordEditorService.table.removeRow(key);

    expect(wordEditorService.table.table.findRow(key)).toBe(undefined);
});

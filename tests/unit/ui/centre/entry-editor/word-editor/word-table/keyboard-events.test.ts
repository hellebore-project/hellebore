import { expect, describe } from "vitest";

import { WordColumnKey } from "@/ui/centre/entry-editor/word-editor/word-table";

import { test } from "../fixtures";

describe("cell selection", () => {
    test.scoped({
        wordSpelling: "cell1",
        wordDefinition: "cell2",
    });

    test("arrow keys move selection", async ({ wordEditorService }) => {
        const table = wordEditorService.table.table;
        table.selectSingle("1", WordColumnKey.Spelling);

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "ArrowRight" }),
            "word1",
            WordColumnKey.Spelling,
        );
        expect(table.activeCell).toStrictEqual({
            rowKey: "word1",
            colKey: WordColumnKey.Definition,
        });

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "ArrowLeft" }),
            "word1",
            WordColumnKey.Definition,
        );
        expect(table.activeCell).toStrictEqual({
            rowKey: "word1",
            colKey: WordColumnKey.Spelling,
        });

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "ArrowDown" }),
            "word1",
            WordColumnKey.Spelling,
        );
        expect(table.activeCell).toStrictEqual({
            rowKey: wordEditorService.table.sentinelKey,
            colKey: WordColumnKey.Spelling,
        });

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "ArrowUp" }),
            wordEditorService.table.sentinelKey,
            WordColumnKey.Spelling,
        );
        expect(table.activeCell).toStrictEqual({
            rowKey: "word1",
            colKey: WordColumnKey.Spelling,
        });
    });

    test("arrow keys reduce the selection to a single cell before moving", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.selectSingle("word1", WordColumnKey.Spelling);
        table.selectRange("word1", WordColumnKey.Definition);

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "ArrowRight" }),
            "word1",
            WordColumnKey.Spelling,
        );

        expect(table.selectedCells.size).toBe(1);
        expect(table.selectedCells.has("word1-definition")).toBe(true);
    });
});

describe("cell editing", () => {
    test.scoped({
        wordSpelling: "cell1",
        wordTranslations: ["cell2"],
    });

    test("enter toggles edit mode of text cell", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.selectSingle("word1", WordColumnKey.Spelling);

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "Enter" }),
            "word1",
            WordColumnKey.Spelling,
        );
        expect(table.editCell).toStrictEqual({
            rowKey: "word1",
            colKey: WordColumnKey.Spelling,
        });

        table.setValue("word1", WordColumnKey.Spelling, "cell1-edited");
        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "Enter" }),
            "word1",
            WordColumnKey.Spelling,
        );

        expect(table.editCell).toBe(null);
        expect(table.activeCell).toStrictEqual({
            rowKey: wordEditorService.table.sentinelKey,
            colKey: WordColumnKey.Spelling,
        });
        expect(
            (table.findRow("word1")?.cells[WordColumnKey.Spelling].value ??
                "") === "cell1-edited",
        ).toBe(true);
    });

    test("escape cancels edit and restores value of text cell", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.selectSingle("word1", WordColumnKey.Spelling);
        table.startEdit("word1", WordColumnKey.Spelling);
        table.setValue("word1", WordColumnKey.Spelling, "changed");

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "Escape" }),
            "word1",
            WordColumnKey.Spelling,
        );

        expect(table.editCell).toBe(null);
        expect(
            table.findRow("word1")?.cells[WordColumnKey.Spelling].value,
        ).toBe("cell1");
    });

    test("enter reduces selection to a single cell before editing", async ({
        wordEditorService,
    }) => {
        const table = wordEditorService.table.table;
        table.selectSingle("word1", WordColumnKey.Spelling);
        table.selectRange("word1", WordColumnKey.Definition);

        table.handleKeyDown(
            new KeyboardEvent("keydown", { key: "Enter" }),
            "word1",
            WordColumnKey.Spelling,
        );

        expect(table.selectedCells.size).toBe(1);
        expect(table.selectedCells.has("word1-spelling")).toBe(true);
        expect(table.editCell).toStrictEqual({
            rowKey: "word1",
            colKey: WordColumnKey.Spelling,
        });
    });
});

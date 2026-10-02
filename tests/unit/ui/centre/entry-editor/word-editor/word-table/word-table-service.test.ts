import { expect, vi } from "vitest";

import { WordType } from "@/api";
import {
    WordColumnKey,
    type WordRow,
} from "@/ui/centre/entry-editor/word-editor";

import { test } from "../fixtures";
import { mockDeleteWord } from "@tests/utils/mocks";

test.extend({
    words: async ({ languageId, word }, use) => {
        await use([
            word,
            {
                id: "word2",
                languageId: languageId,
                wordType: WordType.Noun,
                spelling: "beta",
                definition: "second",
                translations: ["two", "double"],
            },
        ]);
    },
})(
    "initializes identity and loads rows with transformed cell values",
    ({ wordId, wordTableService }) => {
        expect(wordTableService.id).toBe("word-editor-entry-word-table");
        expect(wordTableService.changed).toBe(false);
        expect(wordTableService.table.rows).toHaveLength(2);

        const row1 = wordTableService.table.findRow(wordId);
        expect(row1).toBeDefined();
        expect(row1?.cells.wordType.value).toBe(String(WordType.Noun));
        expect(row1?.cells.spelling.value).toBe("alpha");
        expect(row1?.cells.definition.value).toBe("first");
        expect(row1?.cells.translations.value).toBe("one, single");

        const row2 = wordTableService.table.findRow("word2");
        expect(row2?.cells.translations.value).toBe("two, double");
    },
);

test("editing a row emits change without appending another row", ({
    wordId,
    wordTableService,
}) => {
    const onChange = vi.fn();
    wordTableService.onChange.subscribe(onChange);
    const initialRowCount = wordTableService.table.rows.length;

    wordTableService.table.setCellValue(
        wordId,
        WordColumnKey.Spelling,
        "updated alpha",
    );

    expect(wordTableService.table.rows).toHaveLength(initialRowCount);
    expect(wordTableService.table.findRow(wordId)?.cells.spelling.value).toBe(
        "updated alpha",
    );
    expect(onChange).toHaveBeenCalledOnce();
    expect(wordTableService.changed).toBe(true);
});

test("appends new rows with unique keys and the default word type", ({
    languageId,
    wordTableService,
}) => {
    const initialRowCount = wordTableService.table.rows.length;
    const addRow = vi.spyOn(wordTableService.table, "appendRow");

    const firstKey = wordTableService.appendRow();
    const secondKey = wordTableService.appendRow();
    const firstRow = wordTableService.table.findRow(firstKey) as
        WordRow | undefined;
    const secondRow = wordTableService.table.findRow(secondKey) as
        WordRow | undefined;

    expect(firstKey).not.toBe(secondKey);
    expect(addRow).toHaveBeenCalledTimes(2);
    expect(wordTableService.table.rows).toHaveLength(initialRowCount + 2);
    expect(wordTableService.table.rows.at(-2)?.key).toBe(firstKey);
    expect(wordTableService.table.rows.at(-1)?.key).toBe(secondKey);
    expect(firstRow?.metaData.languageId).toBe(languageId);
    expect(firstRow?.metaData.id).toBeNull();
    expect(firstRow?.cells.wordType.value).toBe(String(WordType.RootWord));
    expect(firstRow?.cells.spelling.value).toBe("");
    expect(firstRow?.cells.definition.value).toBe("");
    expect(firstRow?.cells.translations.value).toBe("");
    expect(wordTableService.table.modifiedKeys.has(firstKey)).toBe(true);
});

test("inserts new rows above and below a target row", ({
    wordId,
    wordTableService,
}) => {
    const originalKeys = wordTableService.table.rows.map((row) => row.key);

    wordTableService.insertRowAbove(wordId);
    const aboveKey = wordTableService.table.rows[0].key;

    wordTableService.insertRowBelow(wordId);
    const rows = wordTableService.table.rows;
    const targetIndex = rows.findIndex((row) => row.key === wordId);
    const belowKey = rows[targetIndex + 1].key;

    expect(rows[targetIndex - 1].key).toBe(aboveKey);
    expect(rows[targetIndex + 1].key).toBe(belowKey);
    expect(originalKeys).not.toContain(aboveKey);
    expect(originalKeys).not.toContain(belowKey);
    expect(aboveKey).not.toBe(belowKey);
    expect(wordTableService.table.modifiedKeys.has(aboveKey)).toBe(true);
    expect(wordTableService.table.modifiedKeys.has(belowKey)).toBe(true);
});

test("claims modified rows as domain words with parsed translations and clears changed tracking", ({
    languageId,
    wordId,
    wordTableService,
}) => {
    wordTableService.table.setCellValue(
        wordId,
        WordColumnKey.Translations,
        " alpha, beta ; gamma ;; , ",
    );

    expect(wordTableService.changed).toBe(true);

    const claimed = wordTableService.claimModifiedWords();

    expect(claimed).toStrictEqual([
        {
            key: wordId,
            id: wordId,
            wordType: WordType.Noun,
            languageId,
            spelling: "alpha",
            definition: "first",
            translations: ["alpha", "beta", "gamma"],
        },
    ]);
    expect(wordTableService.changed).toBe(false);
    expect(wordTableService.table.modifiedKeys.size).toBe(0);
});

test("synchronizes backend ids into existing table rows by key", ({
    wordId,
    wordTableService,
}) => {
    wordTableService.table.setCellValue(
        wordId,
        WordColumnKey.Spelling,
        "updated alpha",
    );

    const [changedWord] = wordTableService.claimModifiedWords();
    wordTableService.handleSynchronization([
        {
            ...changedWord,
            id: "word999",
        },
    ]);

    const updatedRow = wordTableService.table.findRow(wordId) as
        WordRow | undefined;
    expect(updatedRow?.metaData.id).toBe("word999");
});

test("removes persisted rows via domain delete", async ({
    mockedInvoker,
    wordId,
    wordTableService,
}) => {
    mockDeleteWord(mockedInvoker);
    await wordTableService.removeRow(wordId);
    expect(wordTableService.table.findRow(wordId)).toBeUndefined();
});

test("keeps persisted row when domain delete fails", async ({
    mockedInvoker,
    wordId,
    wordTableService,
}) => {
    mockDeleteWord(mockedInvoker, () => {
        throw "Delete failed";
    });

    await wordTableService.removeRow(wordId);

    expect(wordTableService.table.findRow(wordId)).toBeDefined();
});

test("clean up table", ({ wordId, wordTableService }) => {
    wordTableService.table.selectSingle(wordId, WordColumnKey.Spelling);
    wordTableService.table.startCellEdit(wordId, WordColumnKey.Spelling);
    wordTableService.table.setCellValue(
        wordId,
        WordColumnKey.Spelling,
        "updated",
    );

    expect(wordTableService.changed).toBe(true);
    expect(wordTableService.table.selectedCells.size).toBe(1);
    expect(wordTableService.table.editableCellKey).not.toBeNull();

    wordTableService.cleanUp();

    expect(wordTableService.changed).toBe(false);
    expect(wordTableService.table.modifiedKeys.size).toBe(0);
    expect(wordTableService.table.selectedCells.size).toBe(0);
    expect(wordTableService.table.editableCellKey).toBeNull();
});

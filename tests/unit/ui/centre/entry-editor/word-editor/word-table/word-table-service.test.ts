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
    "initializes identity and loads rows with transformed cell values plus a sentinel",
    ({ languageId, wordId, wordTableService }) => {
        expect(wordTableService.id).toBe("word-editor-entry-word-table");
        expect(wordTableService.changed).toBe(false);
        expect(wordTableService.table.rows).toHaveLength(3);

        const row1 = wordTableService.table.findRow(wordId);
        expect(row1).toBeDefined();
        expect(row1?.cells.wordType.value).toBe(String(WordType.Noun));
        expect(row1?.cells.spelling.value).toBe("alpha");
        expect(row1?.cells.definition.value).toBe("first");
        expect(row1?.cells.translations.value).toBe("one, single");

        const row2 = wordTableService.table.findRow("word2");
        expect(row2?.cells.translations.value).toBe("two, double");

        const sentinel = wordTableService.table.findRow(
            wordTableService.sentinelKey,
        ) as WordRow | undefined;
        expect(sentinel).toBeDefined();
        expect(sentinel?.id).toBeNull();
        expect(sentinel?.languageId).toBe(languageId);
        expect(sentinel?.filterable).toBe(false);
        expect(sentinel?.cells.wordType.value).toBe("");
        expect(sentinel?.cells.spelling.value).toBe("");
    },
);

test.extend({
    words: [],
})(
    "promotes sentinel row on first edit, applies first active type filter, emits change, and appends a new sentinel",
    ({ wordTableService }) => {
        const onChange = vi.fn();
        wordTableService.onChange.subscribe(onChange);

        const firstSentinel = wordTableService.sentinelKey;

        wordTableService.table.setColumnFilter(WordColumnKey.WordType, [
            String(WordType.Verb),
            String(WordType.Noun),
        ]);
        wordTableService.table.setValue(
            firstSentinel,
            WordColumnKey.Spelling,
            "run",
        );

        const promotedRow = wordTableService.table.findRow(firstSentinel);
        expect(promotedRow).toBeDefined();
        expect(promotedRow?.filterable).toBe(true);
        expect(promotedRow?.cells.spelling.value).toBe("run");
        expect(promotedRow?.cells.wordType.value).toBe(String(WordType.Verb));

        expect(wordTableService.sentinelKey).not.toBe(firstSentinel);
        const nextSentinel = wordTableService.table.findRow(
            wordTableService.sentinelKey,
        );
        expect(nextSentinel?.filterable).toBe(false);
        expect(nextSentinel?.cells.wordType.value).toBe("");

        expect(onChange).toHaveBeenCalledOnce();
        expect(wordTableService.changed).toBe(true);
    },
);

test("claims modified rows as domain words with parsed translations and clears changed tracking", ({
    languageId,
    wordId,
    wordTableService,
}) => {
    wordTableService.table.setValue(
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

test.extend({
    words: [],
})(
    "synchronizes backend ids into existing table rows by key",
    ({ wordTableService }) => {
        const createdKey = wordTableService.sentinelKey;
        wordTableService.table.setValue(
            createdKey,
            WordColumnKey.Spelling,
            "gamma",
        );

        const [claimed] = wordTableService.claimModifiedWords();
        expect(claimed.id).toBeNull();

        wordTableService.handleSynchronization([
            {
                ...claimed,
                id: "word999",
            },
        ]);

        const createdRow = wordTableService.table.findRow(createdKey) as
            | WordRow
            | undefined;
        expect(createdRow?.id).toBe("word999");
    },
);

test("removes transient rows locally and persisted rows via domain delete", async ({
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
    wordTableService.table.startEdit(wordId, WordColumnKey.Spelling);
    wordTableService.table.setValue(wordId, WordColumnKey.Spelling, "updated");

    expect(wordTableService.changed).toBe(true);
    expect(wordTableService.table.selectedCells.size).toBe(1);
    expect(wordTableService.table.editCell).not.toBeNull();

    wordTableService.cleanUp();

    expect(wordTableService.changed).toBe(false);
    expect(wordTableService.table.modifiedKeys.size).toBe(0);
    expect(wordTableService.table.selectedCells.size).toBe(0);
    expect(wordTableService.table.editCell).toBeNull();
});

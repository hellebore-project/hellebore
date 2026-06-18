import { describe, expect, vi } from "vitest";

import { WordType, type WordResponse } from "@/api";
import { WordTableService } from "@/ui/centre/entry-editor/word-editor/word-table/word-table-service.svelte";
import { WordColumnKey } from "@/ui/centre/entry-editor/word-editor/word-table/word-table-constants";
import type { WordRow } from "@/ui/centre/entry-editor/word-editor/word-table/word-table-interface";
import { test as baseTest } from "@tests/unit/ui/fixtures";

const test = baseTest;

const buildWord = (overrides: Partial<WordResponse> = {}): WordResponse => ({
    id: "entry1",
    languageId: "entry10",
    wordType: WordType.Noun,
    spelling: "alpha",
    definition: "first",
    translations: ["one", "single"],
    ...overrides,
});

describe("WordTableService", () => {
    test("initializes identity and loads rows with transformed cell values plus a sentinel", ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry7",
            domainManager,
            clientData,
        );

        service.load(
            [
                buildWord({ id: "entry11", wordType: WordType.Verb }),
                buildWord({
                    id: "entry12",
                    spelling: "beta",
                    translations: ["two", "double"],
                }),
            ],
            "entry77",
        );

        expect(service.id).toBe("word-table-entry7");
        expect(service.changed).toBe(false);
        expect(service.table.rows).toHaveLength(3);

        const row11 = service.table.findRow("entry11");
        expect(row11).toBeDefined();
        expect(row11?.cells.wordType.value).toBe(String(WordType.Verb));
        expect(row11?.cells.spelling.value).toBe("alpha");
        expect(row11?.cells.definition.value).toBe("first");
        expect(row11?.cells.translations.value).toBe("one, single");

        const row12 = service.table.findRow("entry12");
        expect(row12?.cells.translations.value).toBe("two, double");

        const sentinel = service.table.findRow(service.sentinelKey) as
            | WordRow
            | undefined;
        expect(sentinel).toBeDefined();
        expect(sentinel?.id).toBeNull();
        expect(sentinel?.languageId).toBe("entry77");
        expect(sentinel?.filterable).toBe(false);
        expect(sentinel?.cells.wordType.value).toBe("");
        expect(sentinel?.cells.spelling.value).toBe("");
    });

    test("promotes sentinel row on first edit, applies first active type filter, emits change, and appends a new sentinel", ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry1",
            domainManager,
            clientData,
        );
        const onChange = vi.fn();
        service.onChange.subscribe(onChange);

        service.load([], "entry12");
        const firstSentinel = service.sentinelKey;

        service.table.setColumnFilter(WordColumnKey.WordType, [
            String(WordType.Verb),
            String(WordType.Noun),
        ]);
        service.table.setValue(firstSentinel, WordColumnKey.Spelling, "run");

        const promotedRow = service.table.findRow(firstSentinel);
        expect(promotedRow).toBeDefined();
        expect(promotedRow?.filterable).toBe(true);
        expect(promotedRow?.cells.spelling.value).toBe("run");
        expect(promotedRow?.cells.wordType.value).toBe(String(WordType.Verb));

        expect(service.sentinelKey).not.toBe(firstSentinel);
        const nextSentinel = service.table.findRow(service.sentinelKey);
        expect(nextSentinel?.filterable).toBe(false);
        expect(nextSentinel?.cells.wordType.value).toBe("");

        expect(onChange).toHaveBeenCalledOnce();
        expect(service.changed).toBe(true);
    });

    test("claims modified rows as domain words with parsed translations and clears changed tracking", ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry2",
            domainManager,
            clientData,
        );

        service.load(
            [buildWord({ id: "entry41", wordType: WordType.Adjective })],
            "entry10",
        );
        service.table.setValue(
            "entry41",
            WordColumnKey.Translations,
            " alpha, beta ; gamma ;; , ",
        );

        expect(service.changed).toBe(true);

        const claimed = service.claimModifiedWords();

        expect(claimed).toStrictEqual([
            {
                key: "entry41",
                id: "entry41",
                wordType: WordType.Adjective,
                languageId: "entry10",
                spelling: "alpha",
                definition: "first",
                translations: ["alpha", "beta", "gamma"],
            },
        ]);
        expect(service.changed).toBe(false);
        expect(service.table.modifiedKeys.size).toBe(0);
    });

    test("synchronizes backend ids into existing table rows by key", ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry3",
            domainManager,
            clientData,
        );

        service.load([], "entry3");
        const createdKey = service.sentinelKey;
        service.table.setValue(createdKey, WordColumnKey.Spelling, "gamma");

        const [claimed] = service.claimModifiedWords();
        expect(claimed.id).toBeNull();

        service.handleSynchronization([
            {
                ...claimed,
                id: "entry999",
            },
        ]);

        const createdRow = service.table.findRow(createdKey) as
            | WordRow
            | undefined;
        expect(createdRow?.id).toBe("entry999");
    });

    test("removes transient rows locally and persisted rows via domain delete", async ({
        domainManager,
        clientData,
    }) => {
        const deleteWord = vi
            .spyOn(domainManager.words, "delete")
            .mockResolvedValue(true);
        const service = new WordTableService(
            "word-table-entry4",
            domainManager,
            clientData,
        );

        service.load([buildWord({ id: "entry5" })], "entry22");
        const transientKey = service.sentinelKey;
        service.table.setValue(transientKey, WordColumnKey.Spelling, "delta");
        const currentSentinel = service.sentinelKey;

        await service.removeRow(currentSentinel);
        await service.removeRow("missing");
        await service.removeRow(transientKey);
        await service.removeRow("entry5");

        expect(deleteWord).toHaveBeenCalledOnce();
        expect(deleteWord).toHaveBeenCalledWith(clientData.projectId, "entry5");
        expect(service.table.findRow(transientKey)).toBeUndefined();
        expect(service.table.findRow("entry5")).toBeUndefined();
    });

    test("keeps persisted row when domain delete fails", async ({
        domainManager,
        clientData,
    }) => {
        const deleteWord = vi
            .spyOn(domainManager.words, "delete")
            .mockResolvedValue(false);
        const service = new WordTableService(
            "word-table-entry5",
            domainManager,
            clientData,
        );

        service.load([buildWord({ id: "entry18" })], "entry8");

        await service.removeRow("entry18");

        expect(deleteWord).toHaveBeenCalledOnce();
        expect(service.table.findRow("entry18")).toBeDefined();
    });

    test("cleans up table interaction state by delegating to reset", ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry6",
            domainManager,
            clientData,
        );

        service.load([buildWord({ id: "entry60" })], "entry15");
        service.table.selectSingle("entry60", WordColumnKey.Spelling);
        service.table.startEdit("entry60", WordColumnKey.Spelling);
        service.table.setValue("entry60", WordColumnKey.Spelling, "updated");

        expect(service.changed).toBe(true);
        expect(service.table.selectedCells.size).toBe(1);
        expect(service.table.editCell).not.toBeNull();

        service.cleanUp();

        expect(service.changed).toBe(false);
        expect(service.table.modifiedKeys.size).toBe(0);
        expect(service.table.selectedCells.size).toBe(0);
        expect(service.table.editCell).toBeNull();
    });
});

import { afterEach, describe, expect, vi } from "vitest";

import {
    WordType,
    type PaginatedWordResponse,
    type WordQuery,
    type WordResponse,
} from "@/api";
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

const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

const buildPaginatedResponse = (
    query: WordQuery,
    words: WordResponse[],
): PaginatedWordResponse => {
    const filtered = words.filter((word) => {
        if (word.languageId !== query.languageId) return false;
        if (query.wordTypes && !query.wordTypes.includes(word.wordType)) {
            return false;
        }
        if (
            query.spelling &&
            !word.spelling.toLowerCase().includes(query.spelling.toLowerCase())
        ) {
            return false;
        }
        if (
            query.definition &&
            !word.definition
                .toLowerCase()
                .includes(query.definition.toLowerCase())
        ) {
            return false;
        }
        if (
            query.translations &&
            !word.translations.some((translation) =>
                translation
                    .toLowerCase()
                    .includes(query.translations?.toLowerCase() ?? ""),
            )
        ) {
            return false;
        }
        return true;
    });

    const start = (query.pageIndex - 1) * query.itemsPerPageCount;
    const data = filtered.slice(start, start + query.itemsPerPageCount);
    return {
        data,
        pageIndex: query.pageIndex,
        itemsPerPageCount: query.itemsPerPageCount,
        totalItemCount: filtered.length,
        totalPageCount: Math.max(
            1,
            Math.ceil(filtered.length / query.itemsPerPageCount),
        ),
    };
};

const mockWordPages = (
    service: WordTableService,
    words: WordResponse[],
    projectId: string,
) =>
    vi
        .spyOn(service["_domain"].words, "getAllForLanguage")
        .mockImplementation(async (receivedProjectId, query) => {
            expect(receivedProjectId).toBe(projectId);
            return buildPaginatedResponse(query, words);
        });

afterEach(() => {
    vi.useRealTimers();
});

describe("WordTableService", () => {
    test("loads the current page from the backend and appends a sentinel row", async ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry7",
            domainManager,
            clientData,
        );
        const getWords = mockWordPages(
            service,
            [
                buildWord({
                    id: "entry11",
                    languageId: "entry77",
                    wordType: WordType.Verb,
                }),
                buildWord({
                    id: "entry12",
                    languageId: "entry77",
                    spelling: "beta",
                    translations: ["two", "double"],
                }),
            ],
            clientData.projectId as string,
        );

        await service.load("entry77");

        expect(service.id).toBe("word-table-entry7");
        expect(service.changed).toBe(false);
        expect(service.table.rows).toHaveLength(3);
        expect(service.table.page).toBe(1);
        expect(service.table.pageCount).toBe(1);
        expect(getWords).toHaveBeenCalledWith(clientData.projectId, {
            languageId: "entry77",
            pageIndex: 1,
            itemsPerPageCount: 50,
            wordTypes: null,
            spelling: null,
            definition: null,
            translations: null,
        });

        const row11 = service.table.findRow("entry11");
        expect(row11?.cells.wordType.value).toBe(String(WordType.Verb));
        expect(row11?.cells.spelling.value).toBe("alpha");
        expect(row11?.cells.definition.value).toBe("first");
        expect(row11?.cells.translations.value).toBe("one, single");

        const row12 = service.table.findRow("entry12");
        expect(row12?.cells.translations.value).toBe("two, double");

        const sentinel = service.table.findRow(service.sentinelKey) as
            | WordRow
            | undefined;
        expect(sentinel?.id).toBeNull();
        expect(sentinel?.languageId).toBe("entry77");
        expect(sentinel?.filterable).toBe(false);
        expect(sentinel?.cells.wordType.value).toBe("");
    });

    test("changes page by refetching the requested backend page", async ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry-page",
            domainManager,
            clientData,
        );
        const words = [
            buildWord({
                id: "entry11",
                languageId: "entry77",
                spelling: "alpha",
            }),
            buildWord({
                id: "entry12",
                languageId: "entry77",
                spelling: "beta",
            }),
            buildWord({
                id: "entry13",
                languageId: "entry77",
                spelling: "gamma",
            }),
        ];
        const getWords = vi
            .spyOn(domainManager.words, "getAllForLanguage")
            .mockImplementation(async (_projectId, query) => ({
                ...buildPaginatedResponse(
                    { ...query, itemsPerPageCount: 1 },
                    words,
                ),
                itemsPerPageCount: 1,
            }));

        await service.load("entry77");
        await service.table.changePage(2);
        await flushPromises();

        expect(service.table.page).toBe(2);
        expect(service.table.pageCount).toBe(3);
        expect(service.table.findRow("entry12")).toBeDefined();
        expect(getWords).toHaveBeenNthCalledWith(2, clientData.projectId, {
            languageId: "entry77",
            pageIndex: 2,
            itemsPerPageCount: 50,
            wordTypes: null,
            spelling: null,
            definition: null,
            translations: null,
        });
    });

    test("promotes sentinel row on first edit, applies first active type filter, and appends a new sentinel", async ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry1",
            domainManager,
            clientData,
        );
        vi.spyOn(domainManager.words, "getAllForLanguage").mockResolvedValue({
            data: [],
            pageIndex: 1,
            itemsPerPageCount: 50,
            totalItemCount: 0,
            totalPageCount: 1,
        });
        const onChange = vi.fn();
        service.onChange.subscribe(onChange);

        await service.load("entry12");
        const firstSentinel = service.sentinelKey;

        service.table.setColumnFilter(WordColumnKey.WordType, [
            String(WordType.Verb),
            String(WordType.Noun),
        ]);
        await flushPromises();
        service.table.setValue(firstSentinel, WordColumnKey.Spelling, "run");

        const promotedRow = service.table.findRow(firstSentinel);
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

    test("reloads immediately for type filters and debounces text filters", async ({
        domainManager,
        clientData,
    }) => {
        vi.useFakeTimers();
        const service = new WordTableService(
            "word-table-entry-filter",
            domainManager,
            clientData,
        );
        const getWords = vi
            .spyOn(domainManager.words, "getAllForLanguage")
            .mockImplementation(async (_projectId, query) =>
                buildPaginatedResponse(query, [
                    buildWord({
                        id: "entry11",
                        languageId: "entry77",
                        wordType: WordType.Verb,
                        spelling: "conduire",
                        definition: "guide a vehicle",
                        translations: ["drive"],
                    }),
                ]),
            );

        await service.load("entry77");
        service.table.page = 3;

        service.table.setColumnFilter(WordColumnKey.WordType, [
            String(WordType.Verb),
        ]);
        await flushPromises();

        expect(service.table.page).toBe(1);
        expect(getWords).toHaveBeenLastCalledWith(clientData.projectId, {
            languageId: "entry77",
            pageIndex: 1,
            itemsPerPageCount: 50,
            wordTypes: [WordType.Verb],
            spelling: null,
            definition: null,
            translations: null,
        });

        service.table.setTextColumnFilter(WordColumnKey.Translations, "drive");
        expect(getWords).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(300);
        await flushPromises();

        expect(getWords).toHaveBeenCalledTimes(3);
        expect(getWords).toHaveBeenLastCalledWith(clientData.projectId, {
            languageId: "entry77",
            pageIndex: 1,
            itemsPerPageCount: 50,
            wordTypes: [WordType.Verb],
            spelling: null,
            definition: null,
            translations: "drive",
        });
    });

    test("claims modified rows as domain words with parsed translations and clears changed tracking", async ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry2",
            domainManager,
            clientData,
        );
        vi.spyOn(domainManager.words, "getAllForLanguage").mockResolvedValue({
            data: [buildWord({ id: "entry41", wordType: WordType.Adjective })],
            pageIndex: 1,
            itemsPerPageCount: 50,
            totalItemCount: 1,
            totalPageCount: 1,
        });

        await service.load("entry10");
        service.table.setValue(
            "entry41",
            WordColumnKey.Translations,
            " alpha, beta ; gamma ;; , ",
        );

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

    test("synchronizes backend ids into existing table rows by key", async ({
        domainManager,
        clientData,
    }) => {
        const service = new WordTableService(
            "word-table-entry3",
            domainManager,
            clientData,
        );
        vi.spyOn(domainManager.words, "getAllForLanguage").mockResolvedValue({
            data: [],
            pageIndex: 1,
            itemsPerPageCount: 50,
            totalItemCount: 0,
            totalPageCount: 1,
        });

        await service.load("entry3");
        const createdKey = service.sentinelKey;
        service.table.setValue(createdKey, WordColumnKey.Spelling, "gamma");

        const [claimed] = service.claimModifiedWords();
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
        const service = new WordTableService(
            "word-table-entry4",
            domainManager,
            clientData,
        );
        vi.spyOn(domainManager.words, "getAllForLanguage").mockResolvedValue({
            data: [buildWord({ id: "entry5", languageId: "entry22" })],
            pageIndex: 1,
            itemsPerPageCount: 50,
            totalItemCount: 1,
            totalPageCount: 1,
        });
        const deleteWord = vi
            .spyOn(domainManager.words, "delete")
            .mockResolvedValue(true);

        await service.load("entry22");
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

    test("cleans up interaction state and cancels pending filter reloads", async ({
        domainManager,
        clientData,
    }) => {
        vi.useFakeTimers();
        const service = new WordTableService(
            "word-table-entry6",
            domainManager,
            clientData,
        );
        const getWords = vi
            .spyOn(domainManager.words, "getAllForLanguage")
            .mockResolvedValue({
                data: [buildWord({ id: "entry60", languageId: "entry15" })],
                pageIndex: 1,
                itemsPerPageCount: 50,
                totalItemCount: 1,
                totalPageCount: 1,
            });

        await service.load("entry15");
        service.table.selectSingle("entry60", WordColumnKey.Spelling);
        service.table.startEdit("entry60", WordColumnKey.Spelling);
        service.table.setTextColumnFilter(WordColumnKey.Spelling, "updated");
        service.table.setValue("entry60", WordColumnKey.Spelling, "updated");

        service.cleanUp();
        await vi.advanceTimersByTimeAsync(300);
        await flushPromises();

        expect(service.changed).toBe(false);
        expect(service.table.modifiedKeys.size).toBe(0);
        expect(service.table.selectedCells.size).toBe(0);
        expect(service.table.editCell).toBeNull();
        expect(getWords).toHaveBeenCalledTimes(1);
    });
});

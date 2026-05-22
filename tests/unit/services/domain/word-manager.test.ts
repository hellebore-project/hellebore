import { describe, expect, vi } from "vitest";

import { CommandNames, WordType } from "@/constants";

import { test } from "./fixtures";

const expectInvokePayloadMatch = (
    calls: unknown[][],
    command: string,
    payload: unknown,
) => {
    expect(
        calls.some(
            ([name, args]) =>
                name === command &&
                JSON.stringify(args) === JSON.stringify(payload),
        ),
    ).toBe(true);
};

describe("word manager contracts", () => {
    test("bulkUpsert maps backend diagnostic data into upsert statuses", async ({
        mockedInvoker,
        wordManager,
        words,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Word.BulkUpsert, async () => [
            {
                data: {
                    id: words[0].id,
                    status: {
                        created: false,
                        updated: true,
                    },
                },
                errors: [],
            },
        ]);

        const response = await wordManager.bulkUpsert(words);

        expect(response).toStrictEqual([
            {
                id: words[0].id,
                status: {
                    created: false,
                    updated: true,
                },
            },
        ]);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Word.BulkUpsert,
            {
                words,
            },
        );
    });

    test("getAllForLanguage sends nullable wordType and returns words", async ({
        mockedInvoker,
        wordManager,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Word.GetMany, async () => [
            {
                id: 1,
                languageId: 100,
                wordType: WordType.Noun,
                spelling: "river",
                definition: "a natural stream",
                translations: ["rio"],
            },
        ]);

        const defaultType = await wordManager.getAllForLanguage(100);
        const explicitType = await wordManager.getAllForLanguage(
            100,
            WordType.Adjective,
        );

        expect(defaultType).toHaveLength(1);
        expect(explicitType).toHaveLength(1);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Word.GetMany,
            {
                languageId: 100,
                wordType: null,
            },
        );
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Word.GetMany,
            {
                languageId: 100,
                wordType: WordType.Adjective,
            },
        );
    });

    test("delete returns true on success and false on backend errors", async ({
        mockedInvoker,
        wordManager,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Word.Delete, async () => {
            return;
        });

        const success = await wordManager.delete(1);

        mockedInvoker.mockCommand(CommandNames.Word.Delete, async () => {
            throw new Error("cannot delete");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const failure = await wordManager.delete(1);

        expect(success).toBe(true);
        expect(failure).toBe(false);
        expect(errorSpy).toHaveBeenCalled();
    });

    test("bulkUpsert and getAllForLanguage return null when backend throws", async ({
        mockedInvoker,
        wordManager,
        words,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Word.BulkUpsert, async () => {
            throw new Error("bulk error");
        });
        mockedInvoker.mockCommand(CommandNames.Word.GetMany, async () => {
            throw new Error("query error");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const bulkResponse = await wordManager.bulkUpsert(words);
        const queryResponse = await wordManager.getAllForLanguage(100);

        expect(bulkResponse).toBeNull();
        expect(queryResponse).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
    });
});

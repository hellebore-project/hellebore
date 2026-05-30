import { describe, expect, vi } from "vitest";

import { CommandNames, EntryType, EntryTypeLabel } from "@/api";
import { createDocNode } from "@tests/utils/mocks";

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

describe("entry manager contracts", () => {
    test("create maps person properties and emits create invoke", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Entry.Create, async () => entry);

        const response = await entryManager.create(
            EntryType.Person,
            entry.title,
            entry.folderId,
        );

        expect(response).toStrictEqual(entry);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Entry.Create,
            {
                entry: {
                    folderId: entry.folderId,
                    entityType: EntryType.Person,
                    title: entry.title,
                    properties: {
                        [EntryTypeLabel.Person]: { name: entry.title },
                    },
                },
            },
        );
    });

    test("create rejects unsupported entry types and does not invoke backend", async ({
        mockedInvoker,
        entryManager,
    }) => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await entryManager.create(999 as EntryType, "x", 1);

        expect(response).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
        expect(mockedInvoker.spy).not.toHaveBeenCalled();
    });

    test("update returns null when property update omits entryType", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await entryManager.update({
            id: entry.id,
            properties: { name: "new name" },
        });

        expect(response).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
        expect(mockedInvoker.spy).not.toHaveBeenCalled();
    });

    test("update emits backend payload and returns diagnostic data", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Entry.Update, async () => ({
            data: {
                id: entry.id,
                folderId: { updated: false },
                title: { updated: true, isUnique: true },
                properties: { updated: true },
                text: { updated: false },
                words: [],
            },
            errors: [],
        }));

        const response = await entryManager.update({
            id: entry.id,
            entryType: EntryType.Person,
            title: "renamed",
            properties: { name: "renamed" },
        });

        expect(response).toStrictEqual({
            id: entry.id,
            folderId: { updated: false },
            title: { updated: true, isUnique: true },
            properties: { updated: true },
            text: { updated: false },
            words: [],
        });
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Entry.Update,
            {
                entry: {
                    id: entry.id,
                    folderId: null,
                    title: "renamed",
                    properties: {
                        [EntryTypeLabel.Person]: { name: "renamed" },
                    },
                    text: null,
                    words: null,
                },
            },
        );
    });

    test("getProperties returns null for malformed payloads", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(
            CommandNames.Entry.GetProperties,
            async () => ({
                info: entry,
                properties: {},
            }),
        );
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await entryManager.getProperties(entry.id);

        expect(response).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Entry.GetProperties,
            {
                id: entry.id,
            },
        );
    });

    test("getArticle logs diagnostic errors and still returns data", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Entry.GetArticle, async () => ({
            data: {
                info: entry,
                text: createDocNode([]),
            },
            errors: [{ UnknownError: {} }],
        }));
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await entryManager.getArticle(entry.id);

        expect(response).not.toBeNull();
        expect(response?.info.id).toBe(entry.id);
        expect(errorSpy).toHaveBeenCalled();
    });

    test("search slices backend matches to requested limit", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Entry.Search, async () => [
            entry,
            { ...entry, id: 101, title: "match-2" },
            { ...entry, id: 102, title: "match-3" },
        ]);

        const response = await entryManager.search({
            keyword: "match",
            limit: 2,
        });

        expect(response).toStrictEqual([
            entry,
            { ...entry, id: 101, title: "match-2" },
        ]);
    });

    test("delete returns false when backend delete fails", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Entry.Delete, async () => {
            throw new Error("cannot delete");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await entryManager.delete(entry.id);

        expect(response).toBe(false);
        expect(errorSpy).toHaveBeenCalled();
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Entry.Delete,
            {
                id: entry.id,
            },
        );
    });

    test("validateTitle returns data and null when backend throws", async ({
        mockedInvoker,
        entryManager,
        entry,
    }) => {
        mockedInvoker.mockCommand(
            CommandNames.Entry.ValidateTitle,
            async () => ({
                data: true,
                errors: [],
            }),
        );

        const success = await entryManager.validateTitle(entry.id, entry.title);
        expect(success).toBe(true);

        mockedInvoker.mockCommand(
            CommandNames.Entry.ValidateTitle,
            async () => {
                throw new Error("validation down");
            },
        );
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const failure = await entryManager.validateTitle(entry.id, entry.title);

        expect(failure).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
    });
});

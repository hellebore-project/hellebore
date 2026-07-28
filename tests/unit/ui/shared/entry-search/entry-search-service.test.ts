import { afterEach, beforeEach, expect, vi } from "vitest";

import { EntryType } from "@/api";
import { test } from "./fixtures";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

test("single result", async ({ entrySearchService, entryId, entryTitle }) => {
    entrySearchService.queryString = "Do";
    await vi.advanceTimersByTimeAsync(10);
    expect(entrySearchService.queryResults).toStrictEqual([
        {
            label: entryTitle,
            value: entryId,
        },
    ]);
});

test.extend({
    otherEntries: [
        {
            id: "entry2",
            folderId: "folder",
            entityType: EntryType.Person,
            title: "Dog2",
        },
        {
            id: "entry3",
            folderId: "folder",
            entityType: EntryType.Person,
            title: "Cat",
        },
    ],
})("multiple results", async ({ entrySearchService, entryId, entryTitle }) => {
    entrySearchService.queryString = "D";
    await vi.advanceTimersByTimeAsync(10);
    expect(entrySearchService.queryResults).toStrictEqual([
        {
            label: entryTitle,
            value: entryId,
        },
        {
            label: "Dog2",
            value: "entry2",
        },
    ]);
});

test("clears results and skips backend search when query is empty", async ({
    entrySearchService,
}) => {
    entrySearchService.queryResults = [
        {
            label: "existing",
            value: "entry99",
        },
    ];
    entrySearchService.queryString = "";

    await vi.advanceTimersByTimeAsync(10);

    expect(entrySearchService.queryResults).toStrictEqual([]);
});

test("emits open-entry event and cleans up state when selecting a valid id", async ({
    entrySearchService,
}) => {
    const onOpenEntry = vi.fn();
    entrySearchService.onOpenEntry.subscribe(onOpenEntry);

    entrySearchService.queryString = "entry";
    entrySearchService.queryResults = [
        {
            label: "entry",
            value: "entry11",
        },
    ];

    entrySearchService.selectEntry("entry11");

    expect(onOpenEntry).toHaveBeenCalledWith({
        id: "entry11",
        focus: true,
    });
    expect(entrySearchService.queryString).toBe("");
    expect(entrySearchService.queryResults).toStrictEqual([]);
});

test("ignores null and undefined selections", async ({
    entrySearchService,
}) => {
    const onOpenEntry = vi.fn();
    entrySearchService.onOpenEntry.subscribe(onOpenEntry);

    entrySearchService.queryString = "still-set";
    entrySearchService.queryResults = [
        {
            label: "still-set",
            value: "entry5",
        },
    ];

    entrySearchService.selectEntry(null);
    entrySearchService.selectEntry(undefined);

    expect(onOpenEntry).not.toHaveBeenCalled();
    expect(entrySearchService.queryString).toBe("still-set");
    expect(entrySearchService.queryResults).toStrictEqual([
        {
            label: "still-set",
            value: "entry5",
        },
    ]);
});

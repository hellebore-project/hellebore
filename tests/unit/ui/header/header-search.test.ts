import { waitFor } from "@testing-library/svelte";
import { NIL as NIL_UUID } from "uuid";
import { describe, expect, vi } from "vitest";

import { EntryType } from "@/api";

import { test } from "./fixtures";

describe("search service", () => {
    test.override({
        otherEntries: async ({}, use) => {
            use([
                {
                    id: "entry2",
                    entityType: EntryType.Person,
                    folderId: NIL_UUID,
                    title: "mocked-entry-2",
                },
            ]);
        },
    });

    test("typing keyword updates search results", async ({
        headerManager,
        entryTitle,
    }) => {
        headerManager.entrySearch.queryPeriod = 0;

        headerManager.entrySearch.queryString = "mocked";

        await waitFor(() => {
            expect(headerManager.entrySearch.queryResults.length).toBe(2);
        });

        const labels = headerManager.entrySearch.queryResults.map(
            (r) => r.label,
        );
        expect(labels).toContain(entryTitle);
        expect(labels).toContain("mocked-entry-2");
    });

    test("selecting an entry emits open-entry event", async ({
        standaloneHeaderManager,
    }) => {
        const headerManager = standaloneHeaderManager;

        const onOpenEntry = vi.fn();
        headerManager.onOpenEntry.subscribe(onOpenEntry);

        headerManager.entrySearch.queryResults = [
            {
                label: "mocked-entry",
                value: "entry1",
            },
        ];

        headerManager.entrySearch.selectEntry("entry1");

        expect(onOpenEntry).toHaveBeenCalledWith({ id: "entry1", focus: true });
        expect(headerManager.entrySearch.queryString).toBe("");
        expect(headerManager.entrySearch.queryResults).toStrictEqual([]);
    });
});

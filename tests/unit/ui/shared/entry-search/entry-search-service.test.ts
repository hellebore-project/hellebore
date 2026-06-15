import { afterEach, beforeEach, describe, expect, vi } from "vitest";

import type { DomainManager } from "@/api";
import { EntryType } from "@/api";
import { EntrySearchService } from "@/ui/shared/entry-search/entry-search-service.svelte";
import { test as baseTest } from "@tests/unit/ui/fixtures";

const test = baseTest;

describe("EntrySearchService", () => {
    const createService = (serviceDomain: DomainManager) => {
        const search = vi.spyOn(serviceDomain.loadedProject.entries, "search");
        const service = new EntrySearchService(serviceDomain);
        service.queryPeriod = 10;

        return { service, search };
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test("debounces query requests and searches only with the latest keyword", async ({
        domainManager,
    }) => {
        const { service, search } = createService(domainManager);
        search.mockResolvedValue([
            {
                id: "7",
                folderId: "1",
                entityType: EntryType.Person,
                title: "latest-entry",
            },
        ]);

        service.queryString = "fir";
        service.queryString = "first";

        await vi.advanceTimersByTimeAsync(10);

        expect(search).toHaveBeenCalledOnce();
        expect(search).toHaveBeenCalledWith({
            keyword: "first",
            limit: 10,
        });
        expect(service.queryResults).toStrictEqual([
            {
                label: "latest-entry",
                value: "7",
            },
        ]);
    });

    test("returns mapped options from entry search results", async ({
        domainManager,
    }) => {
        const { service, search } = createService(domainManager);
        search.mockResolvedValue([
            {
                id: "entry1",
                folderId: "folder",
                entityType: EntryType.Person,
                title: "alpha",
            },
            {
                id: "entry2",
                folderId: "folder",
                entityType: EntryType.Person,
                title: "beta",
            },
        ]);

        service.queryString = "a";

        await vi.advanceTimersByTimeAsync(10);

        expect(service.queryResults).toStrictEqual([
            {
                label: "alpha",
                value: "entry1",
            },
            {
                label: "beta",
                value: "entry2",
            },
        ]);
    });

    test("clears results and skips backend search when query is empty", async ({
        domainManager,
    }) => {
        const { service, search } = createService(domainManager);

        service.queryResults = [
            {
                label: "existing",
                value: "entry99",
            },
        ];

        service.queryString = "";

        await vi.advanceTimersByTimeAsync(10);

        expect(search).not.toHaveBeenCalled();
        expect(service.queryResults).toStrictEqual([]);
    });

    test("handles null backend responses by producing an empty result set", async ({
        domainManager,
    }) => {
        const { service, search } = createService(domainManager);
        search.mockResolvedValue(null);

        service.queryString = "known";

        await vi.advanceTimersByTimeAsync(10);

        expect(search).toHaveBeenCalledOnce();
        expect(service.queryResults).toStrictEqual([]);
    });

    test("emits open-entry event and cleans up state when selecting a valid id", ({
        domainManager,
    }) => {
        const { service } = createService(domainManager);
        const onOpenEntry = vi.fn();
        service.onOpenEntry.subscribe(onOpenEntry);

        service.queryString = "entry";
        service.queryResults = [
            {
                label: "entry",
                value: "entry11",
            },
        ];

        service.selectEntry("entry11");

        expect(onOpenEntry).toHaveBeenCalledWith({
            id: "entry11",
            focus: true,
        });
        expect(service.queryString).toBe("");
        expect(service.queryResults).toStrictEqual([]);
    });

    test("ignores null and undefined selections", ({ domainManager }) => {
        const { service } = createService(domainManager);
        const onOpenEntry = vi.fn();
        service.onOpenEntry.subscribe(onOpenEntry);

        service.queryString = "still-set";
        service.queryResults = [
            {
                label: "still-set",
                value: "entry5",
            },
        ];

        service.selectEntry(null);
        service.selectEntry(undefined);

        expect(onOpenEntry).not.toHaveBeenCalled();
        expect(service.queryString).toBe("still-set");
        expect(service.queryResults).toStrictEqual([
            {
                label: "still-set",
                value: "entry5",
            },
        ]);
    });
});

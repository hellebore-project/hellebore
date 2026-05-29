import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DomainManager } from "@/api";
import { EntrySearchService } from "@/ui/shared/entry-search/entry-search-service.svelte";

describe("EntrySearchService", () => {
    const createService = () => {
        const search = vi.fn();
        const domain = {
            entries: {
                search,
            },
        } as unknown as DomainManager;

        const service = new EntrySearchService(domain);
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

    it("debounces query requests and searches only with the latest keyword", async () => {
        const { service, search } = createService();
        search.mockResolvedValue([{ id: 7, title: "latest-entry" }]);

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
                value: 7,
            },
        ]);
    });

    it("returns mapped options from entry search results", async () => {
        const { service, search } = createService();
        search.mockResolvedValue([
            { id: 1, title: "alpha" },
            { id: 2, title: "beta" },
        ]);

        service.queryString = "a";

        await vi.advanceTimersByTimeAsync(10);

        expect(service.queryResults).toStrictEqual([
            {
                label: "alpha",
                value: 1,
            },
            {
                label: "beta",
                value: 2,
            },
        ]);
    });

    it("clears results and skips backend search when query is empty", async () => {
        const { service, search } = createService();

        service.queryResults = [
            {
                label: "existing",
                value: 99,
            },
        ];

        service.queryString = "";

        await vi.advanceTimersByTimeAsync(10);

        expect(search).not.toHaveBeenCalled();
        expect(service.queryResults).toStrictEqual([]);
    });

    it("handles null backend responses by producing an empty result set", async () => {
        const { service, search } = createService();
        search.mockResolvedValue(null);

        service.queryString = "known";

        await vi.advanceTimersByTimeAsync(10);

        expect(search).toHaveBeenCalledOnce();
        expect(service.queryResults).toStrictEqual([]);
    });

    it("emits open-entry event and cleans up state when selecting a valid id", () => {
        const { service } = createService();
        const onOpenEntry = vi.fn();
        service.onOpenEntry.subscribe(onOpenEntry);

        service.queryString = "entry";
        service.queryResults = [
            {
                label: "entry",
                value: 11,
            },
        ];

        service.selectEntry("11");

        expect(onOpenEntry).toHaveBeenCalledWith({ id: 11, focus: true });
        expect(service.queryString).toBe("");
        expect(service.queryResults).toStrictEqual([]);
    });

    it("ignores null and undefined selections", () => {
        const { service } = createService();
        const onOpenEntry = vi.fn();
        service.onOpenEntry.subscribe(onOpenEntry);

        service.queryString = "still-set";
        service.queryResults = [
            {
                label: "still-set",
                value: 5,
            },
        ];

        service.selectEntry(null);
        service.selectEntry(undefined);

        expect(onOpenEntry).not.toHaveBeenCalled();
        expect(service.queryString).toBe("still-set");
        expect(service.queryResults).toStrictEqual([
            {
                label: "still-set",
                value: 5,
            },
        ]);
    });
});

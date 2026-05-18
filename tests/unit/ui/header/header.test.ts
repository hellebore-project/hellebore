import { screen, waitFor } from "@testing-library/svelte";
import { describe, expect, vi } from "vitest";

import { EntryType } from "@/constants";
import { DomainManager } from "@/services";
import { Header } from "@/ui/header";
import { HeaderManager } from "@/ui/header/header-service.svelte";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("clicking the Home button emits open-home event", async ({
    user,
    headerManager,
}) => {
    const onOpenHome = vi.fn();
    headerManager.onOpenHome.subscribe(onOpenHome);

    render(Header, { props: { service: headerManager } });

    const homeBtn = screen.getByRole("button", { name: "Home" });
    await user.click(homeBtn);

    expect(onOpenHome).toHaveBeenCalledOnce();
});

test("project loaded state controls file menu items", async ({
    headerManager,
    project,
}) => {
    const loadedLabels = headerManager.fileMenuData
        .map((i) => i.label)
        .filter(Boolean);

    expect(loadedLabels).toContain("Close Project");
    expect(loadedLabels).toContain("New Entry");

    headerManager.handleProjectChange({ loaded: false, project: null });

    const unloadedLabels = headerManager.fileMenuData
        .map((i) => i.label)
        .filter(Boolean);

    expect(unloadedLabels).not.toContain("Close Project");
    expect(unloadedLabels).not.toContain("New Entry");

    headerManager.handleProjectChange({ loaded: true, project });
});

describe("search service", () => {
    test.scoped({
        otherEntries: async ({}, use) => {
            use([
                {
                    id: 2,
                    entityType: EntryType.Person,
                    folderId: -1,
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

    test("selecting an entry emits open-entry event", async ({}) => {
        const headerManager = new HeaderManager(new DomainManager());

        const onOpenEntry = vi.fn();
        headerManager.onOpenEntry.subscribe(onOpenEntry);

        headerManager.entrySearch.queryResults = [
            {
                label: "mocked-entry",
                value: 1,
            },
        ];

        headerManager.entrySearch.selectEntry("1");

        expect(onOpenEntry).toHaveBeenCalledWith({ id: 1, focus: true });
        expect(headerManager.entrySearch.queryString).toBe("");
        expect(headerManager.entrySearch.queryResults).toStrictEqual([]);
    });
});

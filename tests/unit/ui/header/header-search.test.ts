import { screen, within } from "@testing-library/svelte";
import { NIL as NIL_UUID } from "uuid";
import { expect, vi } from "vitest";

import { EntryType } from "@/api";
import { Header } from "@/ui/header";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test.override({
    allEntries: [
        {
            id: "entry1",
            entityType: EntryType.Person,
            folderId: NIL_UUID,
            title: "Dog",
        },
        {
            id: "entry2",
            entityType: EntryType.Person,
            folderId: NIL_UUID,
            title: "Dog2",
        },
    ],
});

test("typing keyword updates search results with matching entry titles", async ({
    user,
    headerManager,
}) => {
    headerManager.entrySearch.queryPeriod = 0;

    render(Header, { props: { service: headerManager } });

    const searchField = screen.getByRole("combobox");
    await user.click(searchField);
    await user.keyboard("Do");

    const dropdown = screen.getByRole("presentation");
    const options = within(dropdown).getAllByRole("option");

    expect(options.length).toBe(2);
    expect(options[0].textContent).toBe("Dog");
    expect(options[1].textContent).toBe("Dog2");
});

test("selecting an entry emits open-entry event", async ({
    user,
    headerManager,
}) => {
    const onOpenEntry = vi.fn();
    headerManager.onOpenEntry.subscribe(onOpenEntry);

    headerManager.entrySearch.queryPeriod = 0;

    render(Header, { props: { service: headerManager } });

    let searchField = screen.getByRole("combobox");
    await user.click(searchField);
    await user.keyboard("Do");

    const dropdown = screen.getByRole("presentation");
    const options = within(dropdown).getAllByRole("option");
    await user.click(options[0]);

    expect(onOpenEntry).toHaveBeenCalledWith({ id: "entry1", focus: true });

    searchField = screen.getByRole("combobox");
    expect(searchField.textContent).toBe("");
    expect(headerManager.entrySearch.queryString).toBe("");
});

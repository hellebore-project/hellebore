import { screen, within } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { EntryType } from "@/api";
import { EntrySearchField } from "@/ui/shared/entry-search";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

test("no query", async ({ user, entrySearchService }) => {
    render(EntrySearchField, { props: { service: entrySearchService } });

    const dropdownButton = screen.getByRole("button");
    await user.click(dropdownButton);

    const dropdown = screen.getByRole("listbox");
    within(dropdown).getByText("No entries found");

    expect(entrySearchService.queryResults).toStrictEqual([]);
});

test("single result", async ({
    user,
    entrySearchService,
    entryId,
    entryTitle,
}) => {
    render(EntrySearchField, { props: { service: entrySearchService } });

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    await user.keyboard("Do");

    const dropdown = screen.getByRole("listbox");

    const options = within(dropdown).getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toBe(entryTitle);

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
})(
    "multiple results",
    async ({ user, entrySearchService, entryId, entryTitle }) => {
        render(EntrySearchField, { props: { service: entrySearchService } });

        const combobox = screen.getByRole("combobox");
        await user.click(combobox);
        await user.keyboard("Do");

        const dropdown = screen.getByRole("listbox");

        const options = within(dropdown).getAllByRole("option");
        expect(options).toHaveLength(2);
        expect(options[0].textContent).toBe(entryTitle);
        expect(options[1].textContent).toBe("Dog2");

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
    },
);

test("no results", async ({ user, entrySearchService }) => {
    render(EntrySearchField, { props: { service: entrySearchService } });

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);
    await user.keyboard("Abc");

    const dropdown = screen.getByRole("listbox");
    within(dropdown).getByText("No entries found");

    expect(entrySearchService.queryResults).toStrictEqual([]);
});

test("emits open-entry event when selecting an option", async ({
    user,
    entrySearchService,
    entryId,
}) => {
    const onOpenEntry = vi.fn();
    entrySearchService.onOpenEntry.subscribe(onOpenEntry);

    render(EntrySearchField, { props: { service: entrySearchService } });

    let combobox = screen.getByRole("combobox");
    await user.click(combobox);
    await user.keyboard("Do");

    const dropdown = screen.getByRole("listbox");

    const option = within(dropdown).getByRole("option", { name: "Dog" });
    await user.click(option);

    expect(onOpenEntry).toHaveBeenCalledWith({
        id: entryId,
        focus: true,
    });

    combobox = screen.getByRole("combobox");
    expect(combobox.textContent).toBe("");

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

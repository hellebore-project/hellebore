import { screen } from "@testing-library/svelte";
import { describe, expect, vi } from "vitest";

import { EntryTitle } from "@/ui/centre/entry-editor/title";
import { render } from "@tests/utils";
import { mockBulkUpdateEntries } from "@tests/utils/mocks";

import { test } from "./fixtures";

test("title field displays entry title", async ({
    entryInfoService,
    entryTitle,
}) => {
    render(EntryTitle, { props: { service: entryInfoService } });

    screen.getByDisplayValue(entryTitle);
});

test("editing the title field updates the entry title", async ({
    user,
    entryInfoService,
    entryId,
    entryTitle,
}) => {
    const onChangeTitle = vi.fn();
    entryInfoService.onChangeTitle.subscribe(onChangeTitle);

    render(EntryTitle, { props: { service: entryInfoService } });

    const titleInput = screen.getByDisplayValue(entryTitle);
    await user.click(titleInput);

    await user.keyboard("{ArrowRight>20} edited");

    const expectedTitle = entryTitle + " edited";
    screen.getByDisplayValue(expectedTitle);
    expect(entryInfoService.title).toBe(expectedTitle);
    expect(onChangeTitle).toHaveBeenCalledWith({
        id: entryId,
        titleChanged: true,
        syncImmediately: true,
    });
});

test("empty title displays an error", async ({
    user,
    entryInfoService,
    entryTitle,
}) => {
    render(EntryTitle, { props: { service: entryInfoService } });

    const titleInput = screen.getByDisplayValue(entryTitle);
    await user.clear(titleInput);

    screen.getByText("Empty title");
    expect(entryInfoService.isTitleValid).toBe(false);
});

describe("when title is a duplicate", () => {
    test.override({
        mockedBulkEntryUpdate: async ({ mockedInvoker, entryId }, use) => {
            mockBulkUpdateEntries(mockedInvoker, {
                [entryId]: {
                    id: entryId,
                    folderId: { updated: false },
                    title: { updated: false, isUnique: false },
                    properties: { updated: false },
                    text: { updated: false },
                    words: [],
                },
            });
            await use(null);
        },
    });

    test("an error is displayed", async ({
        user,
        entryInfoService,
        entryTitle,
    }) => {
        render(EntryTitle, { props: { service: entryInfoService } });

        const titleInput = screen.getByDisplayValue(entryTitle);
        await user.click(titleInput);
        // the actual change here doesn't matter, we just need to trigger a sync
        await user.keyboard("abc");

        screen.getByText("Duplicate title");
        expect(entryInfoService.isTitleValid).toBe(false);
        expect(entryInfoService.isTitleUnique).toBe(false);
    });
});

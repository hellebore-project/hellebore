import { screen } from "@testing-library/svelte";
import { beforeAll, describe, expect } from "vitest";

import { ROOT_FOLDER_ID, EntryType } from "@/api";
import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import { mockMissingDomMethods } from "@tests/utils/mocks";
import { render } from "@tests/utils";

import { test, referencedEntryTitle, referencedEntryInfo } from "./fixtures";

beforeAll(async () => mockMissingDomMethods());

describe("multiple options", () => {
    test.scoped({
        otherEntries: async ({}, use) => {
            use([
                referencedEntryInfo,
                {
                    id: 3,
                    folderId: ROOT_FOLDER_ID,
                    entityType: EntryType.Person,
                    title: "mocked-other",
                },
                {
                    id: 4,
                    folderId: ROOT_FOLDER_ID,
                    entityType: EntryType.Person,
                    title: "mocked-another",
                },
            ]);
        },
    });

    test("shows matching options when typing a mention keyword", async ({
        user,
        articleEditorService,
        entryArticleText,
    }) => {
        render(ArticleEditor, { props: { service: articleEditorService } });

        const textBox = screen.getByText(entryArticleText);

        await user.click(textBox);
        await user.keyboard(`{ArrowRight>${entryArticleText.length + 1}/}`);
        await user.keyboard(" @mocked");

        screen.getByRole("button", { name: referencedEntryTitle });
    });

    test("can select an option using the mouse", async ({
        user,
        articleEditorService,
        entryArticleText,
    }) => {
        render(ArticleEditor, { props: { service: articleEditorService } });

        const textBox = screen.getByText(entryArticleText);

        await user.click(textBox);
        await user.keyboard(`{ArrowRight>${entryArticleText.length + 1}/}`);
        await user.keyboard(" @mocked");

        const dropdownItem = screen.getByRole("button", {
            name: referencedEntryTitle,
        });
        await user.click(dropdownItem);

        screen.getByText(entryArticleText);
        screen.getByText(referencedEntryTitle);
    });
});

test("dropdown displays no options when the keyword does not match", async ({
    user,
    articleEditorService,
    entryArticleText,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const textBox = screen.getByText(entryArticleText);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${entryArticleText.length + 1}/}`);
    await user.keyboard(" @no-matches");

    expect(screen.queryByRole("button", { name: referencedEntryTitle })).toBe(
        null,
    );
});

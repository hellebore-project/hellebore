import { screen } from "@testing-library/svelte";
import { beforeAll, describe, expect } from "vitest";

import { EntryType, ROOT_FOLDER_ID } from "@/constants";
import type { EntryInfoResponse } from "@/interface";
import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import {
    createDocNode,
    createParagraphNode,
    createReferenceNode,
    createTextNode,
    mockMissingDomMethods,
} from "@tests/utils/mocks";
import { render } from "@tests/utils";

import { test } from "./fixtures";

const referencedEntryId = 2;
const referencedEntryTitle = "mocked-referenced-entry";
const referencedEntryInfo: EntryInfoResponse = {
    id: referencedEntryId,
    folderId: ROOT_FOLDER_ID,
    entityType: EntryType.Person,
    title: referencedEntryTitle,
};

beforeAll(async () => mockMissingDomMethods());

test.scoped({
    otherEntries: async ({}, use) => use([referencedEntryInfo]),
});

test("can insert a reference to another entry", async ({
    user,
    articleEditorService,
    entryArticleText,
    entryArticle,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const text = entryArticle.content?.[0]?.content?.[0]?.text;
    if (!text)
        throw new Error("Article text node not found in fixture content");

    const textBox = screen.getByText(text);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
    await user.keyboard(" @mocked-referenced");

    const dropdownItem = screen.getByRole("button", {
        name: referencedEntryTitle,
    });
    await user.click(dropdownItem);

    screen.getByText(entryArticleText);
    screen.getByText(referencedEntryTitle);

    const expectedContent = createDocNode([
        createParagraphNode([
            createTextNode(`${entryArticleText} `),
            createReferenceNode(referencedEntryId, referencedEntryTitle),
            createTextNode(" "),
        ]),
    ]);
    expect(articleEditorService.richText.content).toEqual(expectedContent);
});

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
        entryArticle,
    }) => {
        render(ArticleEditor, { props: { service: articleEditorService } });

        const text = entryArticle.content?.[0]?.content?.[0]?.text;
        if (!text)
            throw new Error("Article text node not found in fixture content");

        const textBox = screen.getByText(text);

        await user.click(textBox);
        await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
        await user.keyboard(" @mocked");

        screen.getByRole("button", { name: referencedEntryTitle });
    });

    test("can select an option using the mouse", async ({
        user,
        articleEditorService,
        entryArticleText,
        entryArticle,
    }) => {
        render(ArticleEditor, { props: { service: articleEditorService } });

        const text = entryArticle.content?.[0]?.content?.[0]?.text;
        if (!text)
            throw new Error("Article text node not found in fixture content");

        const textBox = screen.getByText(text);

        await user.click(textBox);
        await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
        await user.keyboard(" @mocked");

        const dropdownItem = screen.getByRole("button", {
            name: referencedEntryTitle,
        });
        await user.click(dropdownItem);

        screen.getByText(entryArticleText);
        screen.getByText(referencedEntryTitle);

        const expectedContent = createDocNode([
            createParagraphNode([
                createTextNode(`${entryArticleText} `),
                createReferenceNode(referencedEntryId, referencedEntryTitle),
                createTextNode(" "),
            ]),
        ]);
        expect(articleEditorService.richText.content).toEqual(expectedContent);
    });
});

test("dropdown displays no options when the keyword does not match", async ({
    user,
    articleEditorService,
    entryArticle,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const text = entryArticle.content?.[0]?.content?.[0]?.text;
    if (!text)
        throw new Error("Article text node not found in fixture content");

    const textBox = screen.getByText(text);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
    await user.keyboard(" @no-matches");

    expect(screen.queryByRole("button", { name: referencedEntryTitle })).toBe(
        null,
    );
});

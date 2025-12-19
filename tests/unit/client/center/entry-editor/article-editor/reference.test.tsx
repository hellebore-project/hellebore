import { screen } from "@testing-library/react";
import { beforeAll, describe, expect } from "vitest";

import { ArticleEditor } from "@/client";
import { EntityType, ROOT_FOLDER_ID } from "@/domain";
import {
    createDocNode,
    createParagraphNode,
    createReferenceNode,
    createTextNode,
    mockMissingDomMethods,
} from "@tests/utils/mocks";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

const referencedEntryId = 2;
const referencedEntryTitle = "mocked-referenced-entry";
const referencedEntryInfo = {
    id: referencedEntryId,
    folderId: ROOT_FOLDER_ID,
    entityType: EntityType.ENTRY,
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
    render(<ArticleEditor service={articleEditorService} />);

    const text = entryArticle.content[0].content[0].text;
    const textBox = screen.getByText(text);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
    await user.keyboard(" @mocked-referenced");

    const dropdownItem = screen.getByText(referencedEntryTitle);
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
    expect(articleEditorService.content).toEqual(expectedContent);
});

test("dropdown displays no results when the keyword does not match any entries", async ({
    user,
    articleEditorService,
    entryArticle,
}) => {
    render(<ArticleEditor service={articleEditorService} />);

    const text = entryArticle.content[0].content[0].text;
    const textBox = screen.getByText(text);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
    await user.keyboard(" @no-matches");

    screen.getByText("No results");
});

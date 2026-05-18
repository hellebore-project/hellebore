import { screen } from "@testing-library/svelte";
import { beforeAll, expect } from "vitest";

import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import {
    createDocNode,
    createParagraphNode,
    createReferenceNode,
    createTextNode,
    mockMissingDomMethods,
} from "@tests/utils/mocks";
import { render } from "@tests/utils";

import {
    test,
    referencedEntryId,
    referencedEntryTitle,
    referencedEntryInfo,
} from "./fixtures";

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

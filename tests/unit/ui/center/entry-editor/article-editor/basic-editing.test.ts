import { screen } from "@testing-library/svelte";
import { beforeAll, expect } from "vitest";

import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import {
    createDocNode,
    createParagraphNode,
    createTextNode,
    mockMissingDomMethods,
} from "@tests/utils/mocks";
import { render } from "@tests/utils";

import { test } from "./fixtures";

beforeAll(async () => mockMissingDomMethods());

test("display article content", async ({
    articleEditorService,
    entryArticle,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const text = entryArticle.content?.[0]?.content?.[0]?.text;
    if (!text)
        throw new Error("Article text node not found in fixture content");

    screen.getByText(text);
});

test("edit article content", async ({
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
    await user.keyboard(" edited");

    const expectedText = `${text} edited`;
    screen.getByText(expectedText);

    const expectedContent = createDocNode([
        createParagraphNode([createTextNode(expectedText)]),
    ]);
    expect(articleEditorService.richText.content).toStrictEqual(
        expectedContent,
    );
});

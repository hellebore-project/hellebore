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
    entryArticleText,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    screen.getByText(entryArticleText);
});

test("edit article content", async ({
    user,
    articleEditorService,
    entryArticleText,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const textBox = screen.getByText(entryArticleText);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${entryArticleText.length + 1}/}`);
    await user.keyboard(" edited");

    const expectedText = `${entryArticleText} edited`;
    screen.getByText(expectedText);

    const expectedContent = createDocNode([
        createParagraphNode([createTextNode(expectedText)]),
    ]);
    expect(articleEditorService.richText.content).toStrictEqual(
        expectedContent,
    );
});

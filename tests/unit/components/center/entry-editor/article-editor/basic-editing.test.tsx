import { screen } from "@testing-library/react";
import { beforeAll, expect } from "vitest";

import { ArticleEditor } from "@/components";
import {
    createDocNode,
    createParagraphNode,
    createTextNode,
    mockMissingDomMethods,
} from "@tests/utils/mocks";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

beforeAll(async () => mockMissingDomMethods());

test("display article content", async ({
    articleEditorService,
    entryArticle,
}) => {
    render(<ArticleEditor service={articleEditorService} />);

    const text = entryArticle.content[0].content[0].text;
    screen.getByText(text);
});

test("edit article content", async ({
    user,
    articleEditorService,
    entryArticle,
}) => {
    render(<ArticleEditor service={articleEditorService} />);

    const text = entryArticle.content[0].content[0].text;
    const textBox = screen.getByText(text);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${text.length + 1}/}`);
    await user.keyboard(" edited");

    const expectedText = `${text} edited`;
    screen.getByText(expectedText);

    const expectedContent = createDocNode([
        createParagraphNode([createTextNode(expectedText)]),
    ]);
    expect(articleEditorService.content).toStrictEqual(expectedContent);
});

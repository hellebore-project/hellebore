import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("display article content", async ({
    articleEditorService,
    entryArticleText,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    screen.getByText(entryArticleText);
});

test("raises changed flag and produces event on edit", async ({
    user,
    articleEditorService,
    entryId,
    entryArticleText,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const onChange = vi.fn();
    articleEditorService.onChange.subscribe(onChange);

    expect(articleEditorService.changed).toBe(false);

    const textBox = screen.getByText(entryArticleText);

    await user.click(textBox);
    await user.keyboard(" ");

    expect(articleEditorService.changed).toBe(true);
    expect(onChange).toHaveBeenCalledWith({
        id: entryId,
        textChanged: true,
    });
});

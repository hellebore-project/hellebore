import { screen } from "@testing-library/svelte";

import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("article editor displays entry title field", async ({
    articleEditorService,
    entryTitle,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    screen.getByDisplayValue(entryTitle);
});

test("entry title can be edited from the article editor", async ({
    user,
    articleEditorService,
    entryTitle,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const titleInput = screen.getByDisplayValue(entryTitle);
    await user.click(titleInput);

    await user.keyboard("{ArrowRight>20} edited");

    const expectedTitle = entryTitle + " edited";
    screen.getByDisplayValue(expectedTitle);
});

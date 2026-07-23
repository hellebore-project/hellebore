import { screen } from "@testing-library/svelte";

import { WordEditor } from "@/ui/centre/entry-editor/word-editor";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("word editor displays entry title field", async ({
    wordEditorService,
    entryTitle,
}) => {
    render(WordEditor, { props: { service: wordEditorService } });

    screen.getByDisplayValue(entryTitle);
});

test("entry title can be edited from the word editor", async ({
    user,
    wordEditorService,
    entryTitle,
}) => {
    render(WordEditor, { props: { service: wordEditorService } });

    const titleInput = screen.getByDisplayValue(entryTitle);
    await user.click(titleInput);

    await user.keyboard("{ArrowRight>20} edited");

    const expectedTitle = entryTitle + " edited";
    screen.getByDisplayValue(expectedTitle);
});

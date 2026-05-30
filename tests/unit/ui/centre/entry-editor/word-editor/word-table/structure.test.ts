import { screen } from "@testing-library/svelte";

import { WordTable } from "@/ui/centre/entry-editor/word-editor/word-table";
import { render } from "@tests/utils";

import { test } from "../fixtures";

test("renders table with correct columns", async ({ wordEditorService }) => {
    render(WordTable, { props: { service: wordEditorService.table } });

    screen.getByText("Type");
    screen.getByText("Spelling");
    screen.getByText("Definition");
    screen.getByText("Translations");
});

test("renders table with correct rows", async ({
    wordEditorService,
    mockedWord,
}) => {
    render(WordTable, { props: { service: wordEditorService.table } });

    screen.getByText(mockedWord.spelling);
    screen.getByText(mockedWord.translations[0]);
});

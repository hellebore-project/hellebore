import { screen } from "@testing-library/react";
import { expect, describe } from "vitest";

import { GrammaticalGender } from "@/constants";
import { WordTable } from "@/panels/center/entity-editor/word-editor/word-table/word-table";
import { test } from "@tests/unit/base";
import {
    mockDeleteWord,
    mockGetWords,
    mockUpsertWords,
} from "@tests/utils/mocks/word-manager";
import { render } from "@tests/utils/render";
import { createWordData } from "@tests/utils/word";

describe("cell selection", () => {
    test("clicking a cell selects only that cell", async ({
        service,
        user,
    }) => {
        const word = createWordData();
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText(word.spelling);
        const cell2 = screen.getByText(word.translations[0]);

        // Click cell1
        await user.click(cell1);
        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeFalsy();

        // Click cell2
        await user.click(cell2);
        expect(cell2.className.includes("selected")).toBeTruthy();
        expect(cell1.className.includes("selected")).toBeFalsy();
    });

    test("ctrl+click adds to selection and makes it active", async ({
        service,
        user,
    }) => {
        const word = createWordData();
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText(word.spelling);
        const cell2 = screen.getByText(word.translations[0]);

        // Click cell1
        await user.click(cell1);
        expect(cell1.className.includes("selected")).toBeTruthy();

        // Ctrl+click cell2
        await user.keyboard("{Control>}");
        await user.click(cell2);
        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeTruthy();
    });

    test("shift+click selects a range", async ({ service, user }) => {
        const word = createWordData();
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText(word.spelling);
        const cell2 = screen.getByText(word.translations[0]);

        // Click cell1
        await user.click(cell1);

        // Shift+click cell2
        await user.keyboard("{Shift>}");
        await user.click(cell2);

        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeTruthy();
    });

    test("dragging from one cell to another selects a rectangle", async ({
        service,
        user,
    }) => {
        const word = createWordData();
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText(word.spelling);
        const cell2 = screen.getByText(word.translations[0]);

        // Mouse down on cell1, drag to cell2, mouse up
        await user.pointer({ target: cell1, keys: "[MouseLeft>]" });
        await user.pointer({ target: cell2 });
        await user.pointer({ target: cell2, keys: "[/MouseLeft]" });

        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeTruthy();
    });

    test("clicking outside deselects all cells", async ({ service, user }) => {
        const word = createWordData();
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(
            <>
                <WordTable />
                <div
                    data-testid="outside"
                    style={{ width: 100, height: 100 }}
                />
            </>,
        );

        const cell1 = screen.getByText(word.spelling);

        // Click cell1
        await user.click(cell1);
        expect(cell1.className.includes("selected")).toBeTruthy();

        // Click outside
        await user.click(screen.getByTestId("outside"));
        expect(cell1.className.includes("selected")).toBeFalsy();
    });
});

describe("cell editing", () => {
    test("can edit a text cell", async ({ service, user }) => {
        const word = createWordData();

        mockUpsertWords(service.domain.words);
        mockGetWords(service.domain.words, [word]);

        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell = screen.getByText(word.spelling);

        // click the cell to select it
        await user.click(cell);

        // click the cell again to toggle edit mode
        await user.click(cell);

        // edit the cell value
        await user.keyboard("[Backspace>9/]");
        await user.keyboard("edited");

        // select another cell to deselect the first cell
        const otherCell = screen.getByText(word.translations[0]);
        await user.click(otherCell);

        const wordData = service.view.entityEditor.lexicon["_words"]["1"];
        expect(wordData.spelling).toBe("edited");
        expect(screen.getByText("edited")).toBeTruthy();
    });

    test("can edit a select cell", async ({ service, user }) => {
        const word = createWordData();
        word.gender = GrammaticalGender.Masculine;

        mockUpsertWords(service.domain.words);
        mockGetWords(service.domain.words, [word]);

        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const genderCell = screen.getByText("Masculine");

        // click the cell to select it
        await user.click(genderCell);

        // click the cell again to toggle edit mode
        await user.click(genderCell);

        // click an option in the dropdown
        const option = await screen.findByRole("option", { name: "Feminine" });
        await user.click(option);

        // select another cell to deselect the first cell
        const otherCell = screen.getByText(word.translations[0]);
        await user.click(otherCell);

        expect(service.view.entityEditor.lexicon["_words"]["1"].gender).toBe(
            GrammaticalGender.Feminine,
        );
        expect(screen.getByText("Feminine")).toBeTruthy();
    });
});

test("can delete a row", async ({ service, user }) => {
    const word = createWordData();

    mockGetWords(service.domain.words, [word]);
    mockDeleteWord(service.domain.words);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, word.word_type);

    const row = wordEditor.spreadsheet.data.rowData[0];
    row.highlighted = true;

    render(<WordTable />);

    // The delete button should be visible because highlighted is true
    // FIXME: query needs to be more specific
    const deleteBtn = screen.getByRole("button");
    await user.click(deleteBtn);

    expect(wordEditor["_words"]["1"]).toBeUndefined();
});

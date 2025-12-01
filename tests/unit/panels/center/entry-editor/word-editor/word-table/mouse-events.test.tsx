import { screen } from "@testing-library/react";
import { expect, describe } from "vitest";

import { WordTable } from "@/client/ui/center/entry-editor/word-editor";
import { test } from "@tests/unit/panels/center/entry-editor/word-editor/fixtures";
import {
    mockDeleteWord,
    mockGetWords,
    mockUpsertWords,
} from "@tests/utils/mocks/backend/word";
import { render } from "@tests/utils/render";
import { createWordData } from "@tests/utils/word";

describe("cell selection", () => {
    test("clicking a cell selects only that cell", async ({
        user,
        mockedInvoker,
        wordEditorService,
        entryId,
    }) => {
        const word = createWordData();
        mockGetWords(mockedInvoker, [word]);
        await wordEditorService.initialize(entryId, word.word_type);

        render(<WordTable service={wordEditorService.spreadsheet} />);

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
        user,
        mockedInvoker,
        wordEditorService,
        entryId,
    }) => {
        const word = createWordData();
        mockGetWords(mockedInvoker, [word]);
        await wordEditorService.initialize(entryId, word.word_type);

        render(<WordTable service={wordEditorService.spreadsheet} />);

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

    test("shift+click selects a range", async ({
        user,
        mockedInvoker,
        wordEditorService,
        entryId,
    }) => {
        const word = createWordData();
        mockGetWords(mockedInvoker, [word]);
        await wordEditorService.initialize(entryId, word.word_type);

        render(<WordTable service={wordEditorService.spreadsheet} />);

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
        user,
        mockedInvoker,
        wordEditorService,
        entryId,
    }) => {
        const word = createWordData();
        mockGetWords(mockedInvoker, [word]);
        await wordEditorService.initialize(entryId, word.word_type);

        render(<WordTable service={wordEditorService.spreadsheet} />);

        const cell1 = screen.getByText(word.spelling);
        const cell2 = screen.getByText(word.translations[0]);

        // Mouse down on cell1, drag to cell2, mouse up
        await user.pointer({ target: cell1, keys: "[MouseLeft>]" });
        await user.pointer({ target: cell2 });
        await user.pointer({ target: cell2, keys: "[/MouseLeft]" });

        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeTruthy();
    });

    test("clicking outside deselects all cells", async ({
        user,
        mockedInvoker,
        wordEditorService,
        entryId,
    }) => {
        const word = createWordData();
        mockGetWords(mockedInvoker, [word]);
        await wordEditorService.initialize(entryId, word.word_type);

        render(
            <>
                <WordTable service={wordEditorService.spreadsheet} />
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
    test("can edit a text cell", async ({
        user,
        mockedInvoker,
        wordEditorService,
        entryId,
    }) => {
        const word = createWordData();

        mockUpsertWords(mockedInvoker);
        mockGetWords(mockedInvoker, [word]);

        await wordEditorService.initialize(entryId, word.word_type);

        render(<WordTable service={wordEditorService.spreadsheet} />);

        const cell = screen.getByText(word.spelling);

        // click the cell to select it
        await user.click(cell);

        // click the cell again to toggle edit mode
        await user.click(cell);

        // edit the cell value
        // this ensures that the newly-rendered text field has focus
        await user.keyboard("[Backspace>9/]");
        await user.keyboard("edited");

        // select another cell to deselect the first cell
        const otherCell = screen.getByText(word.translations[0]);
        await user.click(otherCell);

        const rowData = wordEditorService.spreadsheet.data.findRow(
            entryId.toString(),
        );
        if (!rowData) throw "Row data not found";

        expect(rowData.cells["spelling"].value).toBe("edited");
        screen.getByText("edited");
    });
});

test("can delete a row", async ({
    user,
    mockedInvoker,
    wordEditorService,
    entryId,
}) => {
    const word = createWordData();

    mockGetWords(mockedInvoker, [word]);
    mockDeleteWord(mockedInvoker);

    await wordEditorService.initialize(entryId, word.word_type);

    const row = wordEditorService.spreadsheet.data.rowData[0];
    row.highlighted = true;

    render(<WordTable service={wordEditorService.spreadsheet} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete row" });
    await user.click(deleteBtn);

    expect(
        wordEditorService.spreadsheet.data.findRow(entryId.toString()),
    ).toBeNull();
});

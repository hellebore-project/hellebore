import { screen } from "@testing-library/react";
import { expect, describe } from "vitest";

import { GrammaticalGender } from "@/constants";
import { WordTable } from "@/panels/center/entity-editor/word-editor/word-table/word-table";
import { test } from "@tests/unit/base";
import { mockGetWords } from "@tests/utils/mocks/word-manager";
import { render } from "@tests/utils/render";
import { createWordData } from "@tests/utils/word";

describe("cell selection", () => {
    test("arrow keys move selection", async ({ service, user }) => {
        const word = {
            ...createWordData(),
            spelling: "cell1",
            translations: ["cell2"],
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText("cell1");
        const cell2 = screen.getByText("cell2");

        // Select first cell
        await user.click(cell1);
        expect(cell1.className.includes("selected")).toBeTruthy();

        // Arrow right to cell2
        await user.keyboard("{ArrowRight}");
        expect(cell2.className.includes("selected")).toBeTruthy();

        // Arrow left back to cell1
        await user.keyboard("{ArrowLeft}");
        expect(cell1.className.includes("selected")).toBeTruthy();

        // Arrow down to new row
        await user.keyboard("{ArrowDown}");
        expect(cell1.className.includes("selected")).toBeFalsy();

        // Arrow up to first row
        await user.keyboard("{ArrowUp}");
        expect(cell1.className.includes("selected")).toBeTruthy();
    });

    test("arrow keys reduce the selection to a single cell before moving", async ({
        service,
        user,
    }) => {
        const word = {
            ...createWordData(),
            spelling: "cell1",
            translations: ["cell2"],
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText("cell1");
        const cell2 = screen.getByText("cell2");

        // Select cell1
        await user.click(cell1);

        // Shift+click cell2 to select both cells
        await user.keyboard("{Shift>}");
        await user.click(cell2);

        // Both cells should be selected
        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeTruthy();

        // Arrow right: selection should reduce to cell2 only
        await user.keyboard("{ArrowRight}");
        expect(cell1.className.includes("selected")).toBeFalsy();
        expect(cell2.className.includes("selected")).toBeTruthy();

        // Arrow left: selection should reduce to cell1 only
        await user.keyboard("{ArrowLeft}");
        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeFalsy();
    });
});

describe("cell editing", () => {
    test("enter toggles edit mode of text cell", async ({ service, user }) => {
        const word = {
            ...createWordData(),
            spelling: "cell1",
            translations: ["cell2"],
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText("cell1");

        // select the cell
        await user.click(cell1);

        // toggle edit mode
        await user.keyboard("{Enter}");
        screen.getByDisplayValue("cell1");

        // edit the cell value
        await user.keyboard("-edited");

        // Enter again to finish edit and move selection down
        await user.keyboard("{Enter}");
        screen.getByText("cell1-edited");
        expect(cell1.className.includes("selected")).toBeFalsy();
    });

    test("escape cancels edit and restores value of text cell", async ({
        service,
        user,
    }) => {
        const word = {
            ...createWordData(),
            spelling: "cell1",
            translations: ["cell2"],
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText("cell1");

        // Select cell1
        await user.click(cell1);

        // Enter to edit
        await user.keyboard("{Enter}");
        const input = screen.getByDisplayValue("cell1");
        await user.clear(input);
        await user.keyboard("changed");

        // Escape to cancel edit
        await user.keyboard("{Escape}");
        screen.getByText("cell1");
    });

    test("enter toggles edit mode of select cell", async ({
        service,
        user,
    }) => {
        const word = {
            ...createWordData(),
            gender: GrammaticalGender.Masculine,
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const genderCell = screen.getByText("Masculine");

        // select gender cell
        await user.click(genderCell);

        // toggle edit mode
        await user.keyboard("{Enter}");

        // edit the cell
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        screen.getByText("Feminine");
    });

    test("escape exits edit mode of select cell", async ({ service, user }) => {
        const word = {
            ...createWordData(),
            gender: GrammaticalGender.Masculine,
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const genderCell = screen.getByText("Masculine");

        // select gender cell
        await user.click(genderCell);

        // toggle edit mode
        await user.keyboard("{Enter}");

        // Escape to cancel edit
        await user.keyboard("{Escape}");
        screen.getByText("Masculine");
    });

    test("enter reduces the selection to a single cell before toggling it to edit mode", async ({
        service,
        user,
    }) => {
        const word = {
            ...createWordData(),
            spelling: "cell1",
            translations: ["cell2"],
        };
        mockGetWords(service.domain.words, [word]);
        await service.view.entityEditor.lexicon.initialize(1, word.word_type);

        render(<WordTable />);

        const cell1 = screen.getByText("cell1");
        const cell2 = screen.getByText("cell2");

        // Select cell1
        await user.click(cell1);

        // Shift+click cell2 to select both cells
        await user.keyboard("{Shift>}");
        await user.click(cell2);

        // Both cells should be selected
        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeTruthy();

        // Press enter: selection should reduce to cell2 only and enter edit mode
        await user.keyboard("{Enter}");

        // Only cell2 should be selected and in edit mode
        expect(cell1.className.includes("selected")).toBeTruthy();
        expect(cell2.className.includes("selected")).toBeFalsy();
        screen.getByDisplayValue("cell1");
    });
});

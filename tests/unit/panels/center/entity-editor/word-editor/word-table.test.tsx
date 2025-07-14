import { screen } from "@testing-library/react";
import { expect, describe } from "vitest";

import {
    WordType,
    GrammaticalNumber,
    GrammaticalPerson,
    GrammaticalGender,
    VerbForm,
    VerbTense,
} from "@/interface";
import { WordTable } from "@/panels/center/entity-editor/word-editor/word-table/word-table";
import { test } from "@tests/unit/base";
import {
    mockDeleteWord,
    mockGetWords,
    mockUpsertWords,
} from "@tests/utils/mocks/word-manager";
import { render } from "@tests/utils/render";

const createWordData = (wordType: WordType = WordType.Noun) => {
    return {
        id: 1,
        language_id: 1,
        word_type: wordType,
        spelling: "test-word",
        number: GrammaticalNumber.Singular,
        person: GrammaticalPerson.First,
        gender: GrammaticalGender.Masculine,
        verb_form: VerbForm.None,
        verb_tense: VerbTense.None,
        translations: ["translation1"],
    };
};

describe("headers", () => {
    for (const { case_, wordType, headers } of [
        {
            case_: "root word",
            wordType: WordType.RootWord,
            headers: ["Spelling", "Translations"],
        },
        {
            case_: "preposition",
            wordType: WordType.Preposition,
            headers: ["Spelling", "Translations"],
        },
        {
            case_: "conjunction",
            wordType: WordType.Conjunction,
            headers: ["Spelling", "Translations"],
        },
        {
            case_: "article",
            wordType: WordType.Article,
            headers: ["Spelling", "Translations", "Gender", "Number"],
        },
        {
            case_: "pronoun",
            wordType: WordType.Pronoun,
            headers: ["Spelling", "Translations", "Gender", "Person", "Number"],
        },
        {
            case_: "noun",
            wordType: WordType.Noun,
            headers: ["Spelling", "Translations", "Gender"],
        },
        {
            case_: "adjective",
            wordType: WordType.Adjective,
            headers: ["Spelling", "Translations"],
        },
        {
            case_: "adverb",
            wordType: WordType.Adverb,
            headers: ["Spelling", "Translations"],
        },
        {
            case_: "verb",
            wordType: WordType.Verb,
            headers: ["Spelling", "Translations"],
        },
    ]) {
        test(`renders ${case_} table with correct columns`, async ({
            service,
        }) => {
            const word = createWordData(wordType);
            mockGetWords(service.domain.words, [word]);

            const wordEditor = service.view.entityEditor.lexicon;
            await wordEditor.initialize(1, word.word_type);

            render(<WordTable />);

            // Check column headers
            for (const header of headers)
                expect(screen.getByText(header)).toBeTruthy();
        });
    }
});

test("renders WordTable with correct rows", async ({ service }) => {
    const word = createWordData();
    mockGetWords(service.domain.words, [word]);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, word.word_type);

    render(<WordTable />);

    // Check row content
    expect(screen.getByText(word.spelling)).toBeTruthy();
    expect(screen.getByText(word.translations[0])).toBeTruthy();
});

describe("cell editing", () => {
    test("can edit a text cell in WordTable", async ({ service, user }) => {
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

    test("can edit a select cell in WordTable", async ({ service, user }) => {
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

describe("cell manipulation via the keyboard", () => {
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
        expect(screen.getByDisplayValue("cell1")).toBeTruthy();

        // edit the cell value
        await user.keyboard("-edited");

        // Enter again to finish edit and move selection down
        await user.keyboard("{Enter}");
        expect(screen.getByText("cell1-edited")).toBeTruthy();
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
        expect(screen.getByText("cell1")).toBeTruthy();
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

        expect(screen.getByText("Feminine")).toBeTruthy();
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
        expect(screen.getByText("Masculine")).toBeTruthy();
    });
});

test("can delete a row in WordTable", async ({ service, user }) => {
    const word = createWordData();

    mockGetWords(service.domain.words, [word]);
    mockDeleteWord(service.domain.words);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, word.word_type);

    const row = wordEditor.spreadsheet["_rowData"][0];
    row.highlighted = true;

    render(<WordTable />);

    // The delete button should be visible because highlighted is true
    // FIXME: query needs to be more specific
    const deleteBtn = screen.getByRole("button");
    await user.click(deleteBtn);

    expect(wordEditor["_words"]["1"]).toBeUndefined();
});

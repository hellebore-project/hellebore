import { screen, fireEvent } from "@testing-library/react";
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

test("can edit a text cell in WordTable", async ({ service }) => {
    const word = createWordData();

    mockUpsertWords(service.domain.words);
    mockGetWords(service.domain.words, [word]);

    await service.view.entityEditor.lexicon.initialize(1, word.word_type);

    render(<WordTable />);

    const cell = screen.getByText(word.spelling);

    // click the cell to select it
    fireEvent.click(cell);

    // click the cell again to toggle edit mode
    fireEvent.click(cell);

    const spellingInput = screen.getByDisplayValue(word.spelling);

    // edit the cell value
    fireEvent.change(spellingInput, { target: { value: "edited" } });

    // select another cell to deselect the first cell
    const otherCell = screen.getByText(word.translations[0]);
    fireEvent.click(otherCell);

    expect(service.view.entityEditor.lexicon["_words"]["1"].spelling).toBe(
        "edited",
    );
    expect(screen.getByText("edited")).toBeTruthy();
});

test("can edit a select cell in WordTable", async ({ service }) => {
    const word = createWordData();
    word.gender = GrammaticalGender.Masculine;

    mockUpsertWords(service.domain.words);
    mockGetWords(service.domain.words, [word]);

    await service.view.entityEditor.lexicon.initialize(1, word.word_type);

    render(<WordTable />);

    const cell = screen.getByText("Masculine");

    // click the cell to select it
    fireEvent.click(cell);

    // click the cell again to toggle edit mode
    fireEvent.click(cell);

    const genderInput = screen.getByDisplayValue(word.gender);

    // edit the cell value
    fireEvent.change(genderInput, {
        target: { value: GrammaticalGender.Feminine },
    });

    // select another cell to deselect the first cell
    const otherCell = screen.getByText(word.translations[0]);
    fireEvent.click(otherCell);

    // FIXME
    expect(service.view.entityEditor.lexicon["_words"]["1"].gender).toBe(
        GrammaticalGender.Feminine,
    );
    expect(screen.getByText("Feminine")).toBeTruthy();
});

test("can delete a row in WordTable", async ({ service }) => {
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
    fireEvent.click(deleteBtn);

    expect(wordEditor["_words"]["1"]).toBeUndefined();
});

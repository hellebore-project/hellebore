import { screen, fireEvent } from "@testing-library/react";
import { expect } from "vitest";

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
import { mockDeleteWord, mockGetWords } from "@tests/utils/mocks/word-manager";
import { render } from "@tests/utils/render";

const createWordData = () => {
    return {
        id: 1,
        language_id: 1,
        word_type: WordType.Noun,
        spelling: "testword",
        number: GrammaticalNumber.Singular,
        person: GrammaticalPerson.First,
        gender: GrammaticalGender.Masculine,
        verb_form: VerbForm.None,
        verb_tense: VerbTense.None,
        translations: ["translation1"],
    };
};

test("renders WordTable with correct columns and rows", async ({ service }) => {
    const word = createWordData();
    mockGetWords(service.domain.words, [word]);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, WordType.Noun);

    render(<WordTable />);

    // Check column headers
    expect(screen.getByText("Spelling")).toBeTruthy();
    expect(screen.getByText("Translations")).toBeTruthy();

    // Check row content
    expect(screen.getByText(word.spelling)).toBeTruthy();
    expect(screen.getByText(word.translations[0])).toBeTruthy();
});

test("can edit a cell in WordTable", async ({ service }) => {
    const word = createWordData();
    mockGetWords(service.domain.words, [word]);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, WordType.Noun);

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

    expect(wordEditor.getWord("1").spelling).toBe("edited");
    expect(screen.getByText("edited")).toBeTruthy();
});

test("can delete a row in WordTable", async ({ service }) => {
    mockGetWords(service.domain.words, [createWordData()]);
    mockDeleteWord(service.domain.words);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, WordType.Noun);

    const row = wordEditor.spreadsheet["_rowData"][0];
    row.highlighted = true;

    render(<WordTable />);

    // The delete button should be visible because highlighted is true
    // FIXME: query needs to be more specific
    const deleteBtn = screen.getByRole("button");
    fireEvent.click(deleteBtn);

    expect(wordEditor.getWord("1")).toBeUndefined();
});

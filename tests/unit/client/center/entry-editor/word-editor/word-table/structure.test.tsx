import { screen } from "@testing-library/react";
import { describe } from "vitest";

import { WordType } from "@/domain";
import { WordTable } from "@/client";
import { render } from "@tests/utils/render";

import { test } from "../fixtures";

describe("headers", () => {
    for (const { case_, headers } of [
        {
            case_: "root word",
            wordType: WordType.RootWord,
            headers: ["Spelling", "Definition"],
        },
        {
            case_: "preposition",
            wordType: WordType.Preposition,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "conjunction",
            wordType: WordType.Conjunction,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "determiner",
            wordType: WordType.Determiner,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "pronoun",
            wordType: WordType.Pronoun,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "noun",
            wordType: WordType.Noun,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "adjective",
            wordType: WordType.Adjective,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "adverb",
            wordType: WordType.Adverb,
            headers: ["Spelling", "Definition", "Translations"],
        },
        {
            case_: "verb",
            wordType: WordType.Verb,
            headers: ["Spelling", "Definition", "Translations"],
        },
    ]) {
        test(`renders ${case_} table with correct columns`, async ({
            wordEditorService,
            entryId,
            mockedWord,
        }) => {
            await wordEditorService.load(entryId, mockedWord.wordType);

            render(<WordTable service={wordEditorService.spreadsheet} />);

            // Check column headers
            for (const header of headers) screen.getByText(header);
        });
    }
});

test("renders table with correct rows", async ({
    wordEditorService,
    entryId,
    mockedWord,
}) => {
    await wordEditorService.load(entryId, mockedWord.wordType);

    render(<WordTable service={wordEditorService.spreadsheet} />);

    // Check row content
    screen.getByText(mockedWord.spelling);
    screen.getByText(mockedWord.translations[0]);
});

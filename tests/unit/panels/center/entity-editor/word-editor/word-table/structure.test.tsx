import { screen } from "@testing-library/react";
import { expect, describe } from "vitest";

import { WordType } from "@/constants";
import { WordTable } from "@/panels/center/entity-editor/word-editor/word-table/word-table";
import { test } from "@tests/unit/base";
import { mockGetWords } from "@tests/utils/mocks/word-manager";
import { render } from "@tests/utils/render";
import { createWordData } from "@tests/utils/word";

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

test("renders table with correct rows", async ({ service }) => {
    const word = createWordData();
    mockGetWords(service.domain.words, [word]);

    const wordEditor = service.view.entityEditor.lexicon;
    await wordEditor.initialize(1, word.word_type);

    render(<WordTable />);

    // Check row content
    expect(screen.getByText(word.spelling)).toBeTruthy();
    expect(screen.getByText(word.translations[0])).toBeTruthy();
});

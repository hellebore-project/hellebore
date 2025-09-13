import { screen } from "@testing-library/react";
import { describe } from "vitest";

import { WordType } from "@/domain/constants";
import { WordTable } from "@/client/center/entity-editor/word-editor/word-table/word-table";
import { test } from "@tests/unit/base";
import { mockGetWords } from "@tests/utils/mocks/backend/word";
import { render } from "@tests/utils/render";
import { createWordData } from "@tests/utils/word";

describe("headers", () => {
    for (const { case_, wordType, headers } of [
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
            mockedInvoker,
            service,
        }) => {
            const word = createWordData(wordType);
            mockGetWords(mockedInvoker, [word]);

            const wordEditor = service.entityEditor.lexicon;
            await wordEditor.initialize(1, word.word_type);

            render(<WordTable />);

            // Check column headers
            for (const header of headers) screen.getByText(header);
        });
    }
});

test("renders table with correct rows", async ({ mockedInvoker, service }) => {
    const word = createWordData();
    mockGetWords(mockedInvoker, [word]);

    const wordEditor = service.entityEditor.lexicon;
    await wordEditor.initialize(1, word.word_type);

    render(<WordTable />);

    // Check row content
    screen.getByText(word.spelling);
    screen.getByText(word.translations[0]);
});

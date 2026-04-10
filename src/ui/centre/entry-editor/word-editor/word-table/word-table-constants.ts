import { WordType } from "@/constants";

export enum WordColumnKey {
    WordType = "wordType",
    Spelling = "spelling",
    Definition = "definition",
    Translations = "translations",
}

export const WORD_COLUMNS: WordColumnKey[] = [
    WordColumnKey.WordType,
    WordColumnKey.Spelling,
    WordColumnKey.Definition,
    WordColumnKey.Translations,
];

export const WORD_COLUMN_LABELS: Record<WordColumnKey, string> = {
    [WordColumnKey.WordType]: "Type",
    [WordColumnKey.Spelling]: "Spelling",
    [WordColumnKey.Definition]: "Definition",
    [WordColumnKey.Translations]: "Translations",
};

export const WORD_TYPE_ITEMS: { value: WordType; label: string }[] = [
    { value: WordType.RootWord, label: "Root Words" },
    { value: WordType.Determiner, label: "Determiners" },
    { value: WordType.Preposition, label: "Prepositions" },
    { value: WordType.Conjunction, label: "Conjunctions" },
    { value: WordType.Pronoun, label: "Pronouns" },
    { value: WordType.Noun, label: "Nouns" },
    { value: WordType.Adjective, label: "Adjectives" },
    { value: WordType.Adverb, label: "Adverbs" },
    { value: WordType.Verb, label: "Verbs" },
];

export const ALL_WORD_TYPES: WordType[] = WORD_TYPE_ITEMS.map((m) => m.value);

export const WORD_TYPE_SELECT_ITEMS: { value: string; label: string }[] =
    WORD_TYPE_ITEMS.map((m) => ({ value: String(m.value), label: m.label }));

import { WordType } from "@/constants";

export const WORD_VIEW_MAP: { wordType: WordType; label: string }[] = [
    { wordType: WordType.RootWord, label: "Root Words" },
    { wordType: WordType.Determiner, label: "Determiners" },
    { wordType: WordType.Preposition, label: "Prepositions" },
    { wordType: WordType.Conjunction, label: "Conjunctions" },
    { wordType: WordType.Pronoun, label: "Pronouns" },
    { wordType: WordType.Noun, label: "Nouns" },
    { wordType: WordType.Adjective, label: "Adjectives" },
    { wordType: WordType.Adverb, label: "Adverbs" },
    { wordType: WordType.Verb, label: "Verbs" },
];

export const ALL_WORD_TYPES: WordType[] = WORD_VIEW_MAP.map((m) => m.wordType);

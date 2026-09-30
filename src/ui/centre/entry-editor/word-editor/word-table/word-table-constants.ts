import { DataType, WordProperty, WordType } from "@/api";
import type { DataColumn } from "@/lib/components/data-table";

import type {
    WordColumnMetaData,
    WordTypeItem,
    WordTypeSelectItem,
} from "./word-table-interface";

export enum WordColumnKey {
    WordType = "wordType",
    Spelling = "spelling",
    Definition = "definition",
    Translations = "translations",
}

export const WORD_COLUMN_KEYS: WordColumnKey[] = [
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

export const WORD_TYPE_ITEMS: WordTypeItem[] = [
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

export const WORD_TYPE_ITEM_MAP: Partial<Record<WordType, WordTypeItem>> =
    Object.fromEntries(
        WORD_TYPE_ITEMS.map(({ value, label }) => [value, { value, label }]),
    );

export const WORD_TYPE_SELECT_ITEMS: WordTypeSelectItem[] = WORD_TYPE_ITEMS.map(
    (m) => ({ value: String(m.value), label: m.label }),
);

export const WORD_COLUMNS: DataColumn<WordColumnKey, WordColumnMetaData>[] = [
    {
        key: WordColumnKey.WordType,
        label: "Type",
        dataType: DataType.Number,
        fieldType: "select",
        filterable: true,
        items: WORD_TYPE_SELECT_ITEMS,
        metaData: {
            property: WordProperty.WordType,
        },
    },
    {
        key: WordColumnKey.Spelling,
        label: "Spelling",
        dataType: DataType.String,
        fieldType: "text",
        filterable: true,
        metaData: {
            property: WordProperty.Spelling,
        },
    },
    {
        key: WordColumnKey.Definition,
        label: "Definition",
        dataType: DataType.String,
        fieldType: "text",
        filterable: true,
        metaData: {
            property: WordProperty.Definition,
        },
    },
    {
        key: WordColumnKey.Translations,
        label: "Translations",
        // FIXME: the data-type is quite accurate since the translations field is actually an array of strings
        dataType: DataType.String,
        fieldType: "text",
        filterable: true,
        metaData: {
            property: WordProperty.Translations,
        },
    },
];

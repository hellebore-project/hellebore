export enum WordColumnKey {
    Spelling = "spelling",
    Definition = "definition",
    Translations = "translations",
}

export const WORD_COLUMNS: WordColumnKey[] = [
    WordColumnKey.Spelling,
    WordColumnKey.Definition,
    WordColumnKey.Translations,
];

export const WORD_COLUMN_LABELS: Record<WordColumnKey, string> = {
    [WordColumnKey.Spelling]: "Spelling",
    [WordColumnKey.Definition]: "Definition",
    [WordColumnKey.Translations]: "Translations",
};

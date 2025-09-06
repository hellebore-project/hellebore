import { Id, WordInfo, WordProperties } from "@/interface";

export type WordKey = string;

type BaseWordData = WordInfo & WordProperties;

export interface WordMetaData {
    id: Id | null;
    created?: boolean;
    updated?: boolean;
}

export interface Word extends BaseWordData, WordMetaData {
    id: Id | null;
    key: WordKey;
}

export type WordColumnKeys =
    | "spelling"
    | "translations"
    | "number"
    | "person"
    | "gender";

export enum WordTableColumnKey {
    Spelling = "spelling",
    Number = "number",
    Person = "person",
    Gender = "gender",
    Translations = "translations",
}

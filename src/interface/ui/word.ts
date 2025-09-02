import { Id } from "../common";
import { WordInfo, WordProperties } from "../domain";

export type WordKey = string;

type BaseWordData = WordInfo & WordProperties;

export interface WordExtraData {
    id: Id | null;
    created?: boolean;
    updated?: boolean;
}

export interface WordData extends BaseWordData, WordExtraData {
    key: WordKey;
}

export enum WordTableColumnKey {
    Spelling = "spelling",
    Number = "number",
    Person = "person",
    Gender = "gender",
    Translations = "translations",
}

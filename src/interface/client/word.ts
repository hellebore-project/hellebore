import type { Id } from "../common";
import type { WordInfo, WordProperties } from "../domain";

export type WordKey = string;

type BaseWordData = WordInfo & WordProperties;

export interface WordMetaData {
    id: Id | null;
    created?: boolean;
    updated?: boolean;
}

export interface Word extends BaseWordData, WordMetaData {
    key: WordKey;
}

import { Id, WordInfo, WordProperties } from "@/interface";

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

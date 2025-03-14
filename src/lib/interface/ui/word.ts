import { Id } from "../common";
import { WordInfo, WordProperties } from "../entity";

export type WordKey = string;

type BaseWordData = WordInfo & WordProperties;

export interface WordData extends BaseWordData {
    id: Id | null;
    key: WordKey;
    rawTranslations: string;
    highlighted?: boolean | null;
    created?: boolean;
    updated?: boolean;
}

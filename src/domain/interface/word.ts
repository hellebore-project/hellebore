import { WordType } from "@/domain";
import { IdentifiedObject } from "@/interface";

export interface WordInfo {
    language_id: number;
    word_type: WordType;
}

export interface WordProperties {
    spelling: string;
    definition: string;
    translations: string[];
}

export interface OptionalWordProperties {
    spelling: string | null;
    definition: string | null;
    translations: string[] | null;
}

export type IdentifiedWordInfo = IdentifiedObject & WordInfo;

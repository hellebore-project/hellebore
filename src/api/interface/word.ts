import type { Id, IdentifiedObject } from "@/interface";

import { WordType } from "../constants";

export interface WordInfo {
    languageId: Id;
    wordType: WordType;
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

export type WordCreate = WordInfo & OptionalWordProperties;

export type WordUpdate = IdentifiedWordInfo & WordCreate;

export interface WordUpsert extends WordCreate {
    id: Id | null;
}

export interface WordUpsertResponse {
    id: Id | null;
    status: {
        created: boolean;
        updated: boolean;
    };
}

export interface WordListRequest {
    languageId?: Id | null;
    wordTypes?: WordType[] | null;
    keyword?: string | null;
}

// Interfaces for fetching words
export type WordResponse = IdentifiedWordInfo & WordProperties;

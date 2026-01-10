// Interfaces for creating and updating words

import { WordType } from "@/constants";

import { Id, IdentifiedObject } from "../common";

export interface WordInfo {
    languageId: number;
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

// Interfaces for fetching words
export type WordResponse = IdentifiedWordInfo & WordProperties;

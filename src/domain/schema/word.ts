// Interfaces for creating and updating words

import { Id } from "@/interface";
import {
    IdentifiedWordInfo,
    OptionalWordProperties,
    WordInfo,
    WordProperties,
} from "@/domain/interface";

export type WordCreate = WordInfo & OptionalWordProperties;

export type WordUpdate = IdentifiedWordInfo & WordCreate;

export interface WordUpsert extends WordCreate {
    id: Id | null;
}

export interface WordUpsertResponse extends WordUpsert {
    created: boolean;
    updated: boolean;
}

// Interfaces for fetching words
export type WordResponse = IdentifiedWordInfo & WordProperties;

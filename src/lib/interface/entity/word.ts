import { Id, IdentifiedObject } from "../common";

export enum WordType {
    None = 0,
    RootWord = 1,
    Article = 11,
    Preposition = 12,
    Conjunction = 13,
    Pronoun = 21,
    Noun = 31,
    Adjective = 41,
    Adverb = 42,
    Verb = 51,
}

export enum GrammaticalNumber {
    None = 0,
    Singular = 1,
    Dual = 2,
    Trial = 3,
    Quadral = 4,
    Quintal = 5,
    Paucal = 11,
    GreaterPaucal = 12,
    Plural = 21,
    GreaterPlural = 22,
    GreatestPlural = 23,
}

export enum GrammaticalGender {
    None = 0,
    Neutral = 1,
    Masculine = 11,
    Feminine = 12,
}

export enum GrammaticalPerson {
    None = 0,
    First = 1,
    Second = 2,
    Third = 3,
}

export enum VerbForm {
    None = 0,
    Infinitive = 1,
    Finite = 2,
}

export enum VerbTense {
    None = 0,
    Present = 1,
    Past = 11,
    Future = 21,
}

export interface WordInfo {
    language_id: number;
    word_type: WordType;
}

export interface WordProperties {
    spelling: string;
    number: GrammaticalNumber;
    person: GrammaticalPerson;
    gender: GrammaticalGender;
    verb_form: VerbForm;
    verb_tense: VerbTense;
    translations: string[];
}

export interface OptionalWordProperties {
    spelling: string | null;
    number: GrammaticalNumber | null;
    person: GrammaticalPerson | null;
    gender: GrammaticalGender | null;
    verb_form: VerbForm | null;
    verb_tense: VerbTense | null;
    translations: string[] | null;
}

type IdentifiedWordInfo = IdentifiedObject & WordInfo;

// Interfaces for creating and updating words

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

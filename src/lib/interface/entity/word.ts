import { IdentifiedObject } from "../common";

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

interface _BaseWordInfo {
    language_id: number;
    word_type: WordType;
    spelling: string;
}

type _BaseIdentifiedWordInfo = IdentifiedObject & _BaseWordInfo;

// Interfaces for creating words

export type WordCreate = _BaseWordInfo;

// Interfaces for updating words

export interface WordUpdate extends IdentifiedObject {
    language_id: number | null;
    word_type: WordType | null;
    spelling: string | null;
    number: GrammaticalNumber | null;
    person: GrammaticalPerson | null;
    gender: GrammaticalGender | null;
    verb_form: VerbForm | null;
    verb_tense: VerbTense | null;
    translations: string[] | null;
}

export interface WordUpdateResponse extends WordUpdate {}

// Interfaces for creating and fetching words

export interface WordInfoResponse extends _BaseIdentifiedWordInfo {
    translations: string[];
}

export interface WordResponse extends WordInfoResponse {
    number: GrammaticalNumber;
    person: GrammaticalPerson;
    gender: GrammaticalGender;
    verb_form: VerbForm;
    verb_tense: VerbTense;
}

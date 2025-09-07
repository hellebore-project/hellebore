import {
    GrammaticalGender,
    GrammaticalNumber,
    GrammaticalPerson,
    VerbForm,
    VerbTense,
    WordType,
} from "@/domain";
import { IdentifiedObject } from "@/interface";

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

export type IdentifiedWordInfo = IdentifiedObject & WordInfo;

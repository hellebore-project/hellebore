import {
    WordType,
    GrammaticalNumber,
    GrammaticalPerson,
    GrammaticalGender,
    VerbForm,
    VerbTense,
} from "@/constants";

export function createWordData(wordType: WordType = WordType.Noun) {
    return {
        id: 1,
        language_id: 1,
        word_type: wordType,
        spelling: "test-word",
        number: GrammaticalNumber.Singular,
        person: GrammaticalPerson.First,
        gender: GrammaticalGender.Masculine,
        verb_form: VerbForm.None,
        verb_tense: VerbTense.None,
        translations: ["translation1"],
    };
}

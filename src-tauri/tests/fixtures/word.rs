use rstest::*;

use hellebore::{
    schema::word::{WordResponseSchema, WordUpdateSchema},
    types::{
        GrammaticalGender, GrammaticalNumber, GrammaticalPerson, VerbForm, VerbTense, WordType,
    },
    utils::value_or_default,
};

#[fixture]
pub fn word_type() -> WordType {
    WordType::Noun
}

#[fixture]
pub fn word_spelling() -> String {
    "rue".to_owned()
}

#[fixture]
pub fn word_translations() -> Vec<String> {
    vec!["road".to_owned(), "street".to_owned()]
}

#[fixture]
pub fn word_number() -> Option<GrammaticalNumber> {
    Some(GrammaticalNumber::Singular)
}

#[fixture]
pub fn word_person() -> Option<GrammaticalPerson> {
    None
}

#[fixture]
pub fn word_gender() -> Option<GrammaticalGender> {
    Some(GrammaticalGender::Feminine)
}

#[fixture]
pub fn verb_form() -> Option<VerbForm> {
    None
}

#[fixture]
pub fn verb_tense() -> Option<VerbTense> {
    None
}

#[fixture]
pub fn create_word_payload(
    word_type: WordType,
    word_spelling: String,
    word_translations: Vec<String>,
    word_number: Option<GrammaticalNumber>,
    word_person: Option<GrammaticalPerson>,
    word_gender: Option<GrammaticalGender>,
    verb_form: Option<VerbForm>,
    verb_tense: Option<VerbTense>,
) -> WordUpdateSchema {
    WordUpdateSchema {
        id: None,
        language_id: Some(1),
        word_type: Some(word_type),
        spelling: Some(word_spelling),
        number: word_number,
        person: word_person,
        gender: word_gender,
        verb_form,
        verb_tense: verb_tense,
        translations: Some(word_translations),
    }
}

#[fixture]
pub fn expected_word_response(
    word_type: WordType,
    word_spelling: String,
    word_translations: Vec<String>,
    word_number: Option<GrammaticalNumber>,
    word_person: Option<GrammaticalPerson>,
    word_gender: Option<GrammaticalGender>,
    verb_form: Option<VerbForm>,
    verb_tense: Option<VerbTense>,
) -> WordResponseSchema {
    WordResponseSchema {
        word_type,
        spelling: word_spelling,
        translations: word_translations,
        number: value_or_default(word_number),
        person: value_or_default(word_person),
        gender: value_or_default(word_gender),
        verb_form: value_or_default(verb_form),
        verb_tense: value_or_default(verb_tense),
        ..Default::default()
    }
}

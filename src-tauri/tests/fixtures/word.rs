use rstest::*;

use hellebore::{
    schema::word::{WordResponseSchema, WordUpsertSchema},
    types::grammar::WordType,
};

#[fixture]
pub fn word_id() -> i32 {
    0
}

#[fixture]
pub fn word_type() -> WordType {
    WordType::Noun
}

#[fixture]
pub fn word_spelling() -> String {
    "rue".to_owned()
}

#[fixture]
pub fn word_definition() -> String {
    "public thoroughfare within a town or city".to_owned()
}

#[fixture]
pub fn word_translations() -> Vec<String> {
    vec!["road".to_owned(), "street".to_owned()]
}

#[fixture]
pub fn create_word_payload(
    word_type: WordType,
    word_spelling: String,
    word_definition: String,
    word_translations: Vec<String>,
) -> WordUpsertSchema {
    WordUpsertSchema {
        id: None,
        language_id: Some(1),
        word_type: Some(word_type),
        spelling: Some(word_spelling),
        definition: Some(word_definition),
        translations: Some(word_translations),
    }
}

#[fixture]
pub fn update_word_payload(word_id: i32, word_spelling: String) -> WordUpsertSchema {
    WordUpsertSchema {
        id: Some(word_id),
        language_id: Some(1),
        word_type: None,
        spelling: Some(format!("{}-modified", word_spelling)),
        definition: None,
        translations: None,
    }
}

#[fixture]
pub fn expected_word_response(
    word_type: WordType,
    word_spelling: String,
    word_definition: String,
    word_translations: Vec<String>,
) -> WordResponseSchema {
    WordResponseSchema {
        word_type,
        spelling: word_spelling,
        definition: word_definition,
        translations: word_translations,
        ..Default::default()
    }
}

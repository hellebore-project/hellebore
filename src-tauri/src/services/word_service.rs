use sea_orm::DatabaseConnection;

use ::entity::word::Model as Word;
use serde_json;

use crate::database::word_manager;
use crate::errors::ApiError;
use crate::schema::word::WordUpdateSchema;
use crate::schema::{
    response::ResponseDiagnosticsSchema,
    word::{WordCreateSchema, WordResponseSchema},
};
use crate::types::{
    GrammaticalGender, GrammaticalNumber, GrammaticalPerson, VerbForm, VerbTense, WordType, WORD,
};

pub async fn create(
    database: &DatabaseConnection,
    word: WordCreateSchema,
) -> Result<WordResponseSchema, ApiError> {
    return match word_manager::insert(
        &database,
        word.language_id,
        word.word_type,
        &word.spelling,
        GrammaticalNumber::None,
        GrammaticalPerson::None,
        GrammaticalGender::None,
        VerbForm::None,
        VerbTense::None,
        serde_json::from_str("[]").unwrap(),
    )
    .await
    {
        Ok(word) => Ok(generate_response(&word)),
        Err(e) => Err(ApiError::not_inserted(e, WORD)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    word: WordUpdateSchema,
) -> Result<ResponseDiagnosticsSchema<()>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();

    let translations: Option<serde_json::Value> = match word.translations {
        Some(t) => match serde_json::from_str(&t) {
            Ok(_t) => Some(_t),
            Err(e) => {
                errors.push(ApiError::field_not_updated(
                    e,
                    WORD,
                    String::from("translations"),
                ));
                None
            }
        },
        None => None,
    };
    let result = word_manager::update(
        &database,
        word.id,
        word.language_id,
        word.word_type,
        word.spelling,
        word.number,
        word.person,
        word.gender,
        word.verb_form,
        word.verb_tense,
        translations,
    )
    .await;
    match result {
        Err(e) => {
            errors.push(ApiError::not_updated(e, WORD));
        }
        _ => (),
    };

    let response = ResponseDiagnosticsSchema { data: (), errors };
    return Ok(response);
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<WordResponseSchema, ApiError> {
    let word = word_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, WORD))?;
    return match word {
        Some(word) => Ok(generate_response(&word)),
        None => Err(ApiError::not_found("Word not found.", WORD)),
    };
}

pub async fn get_multiple(
    database: &DatabaseConnection,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<WordResponseSchema>, ApiError> {
    let words = word_manager::get_multiple(&database, language_id, word_type)
        .await
        .map_err(|e| ApiError::not_found(e, WORD))?;
    let words = words.iter().map(generate_response).collect();
    return Ok(words);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    word_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, WORD))?;
    return Ok(());
}

fn generate_response(word: &Word) -> WordResponseSchema {
    return WordResponseSchema {
        id: word.id,
        language_id: word.language_id,
        word_type: WordType::from(word.word_type),
        spelling: word.spelling.to_string(),
        number: GrammaticalNumber::from(word.number),
        person: GrammaticalPerson::from(word.person),
        gender: GrammaticalGender::from(word.gender),
        verb_form: VerbForm::from(word.verb_form),
        verb_tense: VerbTense::from(word.verb_tense),
        translations: word.translations.to_string(),
    };
}

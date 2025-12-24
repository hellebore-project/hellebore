use sea_orm::{DatabaseConnection, DatabaseTransaction};

use ::entity::word::Model as Word;
use serde_json;

use crate::database::{transaction_manager, word_manager};
use crate::errors::ApiError;
use crate::schema::word::WordUpdateSchema;
use crate::schema::{common::DiagnosticResponseSchema, word::WordResponseSchema};
use crate::types::entity::WORD;
use crate::types::grammar::WordType;

pub async fn bulk_upsert(
    database: &DatabaseConnection,
    words: Vec<WordUpdateSchema>,
) -> Result<Vec<DiagnosticResponseSchema<Option<i32>>>, ApiError> {
    let txn = transaction_manager::begin(database).await?;

    let mut responses: Vec<DiagnosticResponseSchema<Option<i32>>> = Vec::new();

    for word in words {
        let mut errors: Vec<ApiError> = Vec::new();

        let result: Result<Word, ApiError> = match word.id {
            Some(_) => _update(&txn, word, &mut errors).await,
            None => _create(&txn, word, &mut errors).await,
        };

        let id = match result {
            Ok(w) => Some(w.id),
            Err(e) => {
                errors.push(e);
                None
            }
        };

        responses.push(DiagnosticResponseSchema { data: id, errors })
    }

    transaction_manager::end(txn).await?;
    return Ok(responses);
}

async fn _create(
    txn: &DatabaseTransaction,
    word: WordUpdateSchema,
    errors: &mut Vec<ApiError>,
) -> Result<Word, ApiError> {
    if word.language_id.is_none() {
        return Err(ApiError::field_invalid(
            "Language ID of new word cannot be none",
            WORD,
            None,
            "language_id",
            "None",
        ));
    } else if word.word_type.is_none() {
        return Err(ApiError::field_invalid(
            "Type of new word cannot be none",
            WORD,
            None,
            "word_type",
            "None",
        ));
    }

    let translations = match _serialize_translations(&word.translations) {
        Ok(t) => t,
        Err(e) => {
            errors.push(e);
            None
        }
    };

    return word_manager::insert(
        txn,
        word.language_id.unwrap(),
        word.word_type.unwrap(),
        word.spelling,
        word.definition,
        translations,
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, WORD));
}

async fn _update(
    txn: &DatabaseTransaction,
    word: WordUpdateSchema,
    errors: &mut Vec<ApiError>,
) -> Result<Word, ApiError> {
    if word.id.is_none() {
        return Err(ApiError::field_invalid(
            "Word ID cannot be none",
            WORD,
            None,
            "id",
            "None",
        ));
    }

    let translations = match _serialize_translations(&word.translations) {
        Ok(t) => t,
        Err(e) => {
            errors.push(e);
            None
        }
    };

    word_manager::update(
        txn,
        word.id.unwrap(),
        word.language_id,
        word.word_type,
        word.spelling,
        word.definition,
        translations,
    )
    .await
    .map_err(|e| ApiError::not_updated(e, WORD))
}

pub fn _serialize_translations(
    translations: &Option<Vec<String>>,
) -> Result<Option<serde_json::Value>, ApiError> {
    match translations {
        Some(t) => match serde_json::to_value(&t) {
            Ok(_t) => Ok(Some(_t)),
            Err(e) => Err(ApiError::field_not_updated(
                e,
                WORD,
                String::from("translations"),
            )),
        },
        None => Ok(None),
    }
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<WordResponseSchema, ApiError> {
    let word = word_manager::get(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, WORD))?;
    return match word {
        Some(word) => Ok(generate_response(&word)?),
        None => Err(ApiError::not_found("Word not found.", WORD)),
    };
}

pub async fn get_all_for_language(
    database: &DatabaseConnection,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<WordResponseSchema>, ApiError> {
    let words = word_manager::get_all_for_language(database, language_id, word_type)
        .await
        .map_err(|e| ApiError::not_found(e, WORD))?;

    let mut word_responses: Vec<WordResponseSchema> = Vec::new();
    for word in words.iter() {
        let word_response = match generate_response(word) {
            Ok(w) => w,
            Err(e) => return Err(e),
        };
        word_responses.push(word_response);
    }

    return Ok(word_responses);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    word_manager::delete(database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, WORD))?;
    return Ok(());
}

fn generate_response(word: &Word) -> Result<WordResponseSchema, ApiError> {
    return Ok(WordResponseSchema {
        id: word.id,
        language_id: word.language_id,
        word_type: WordType::from(word.word_type),
        spelling: word.spelling.to_string(),
        definition: word.definition.to_string(),
        translations: _convert_translations_to_vec(word.id, &word.translations)?,
    });
}

fn _convert_translations_to_vec(
    id: i32,
    translations: &serde_json::Value,
) -> Result<Vec<String>, ApiError> {
    let generic_array = match translations.as_array() {
        Some(array) => array,
        None => {
            return Err(ApiError::field_invalid(
                "",
                WORD,
                Some(id),
                "translations",
                translations.to_string(),
            ));
        }
    };

    let mut array: Vec<String> = Vec::new();
    for value in generic_array.iter() {
        let str_value = match value.as_str() {
            Some(v) => v.to_string(),
            None => {
                return Err(ApiError::field_invalid(
                    "",
                    WORD,
                    Some(id),
                    "translations",
                    value.to_string(),
                ));
            }
        };
        array.push(str_value);
    }

    Ok(array)
}

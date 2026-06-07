use sea_orm::{ConnectionTrait, DatabaseConnection};

use ::entity::word::Model as Word;
use serde_json;

use crate::database::word_manager;
use crate::model::errors::{Error, ErrorBuilder};
use crate::schema::{
    common::DiagnosticResponseSchema,
    word::{WordResponseSchema, WordUpsertResponseSchema, WordUpsertSchema},
};
use crate::types::entity::WORD;
use crate::types::grammar::WordType;

pub async fn bulk_upsert(
    database: &DatabaseConnection,
    words: Vec<WordUpsertSchema>,
) -> Result<Vec<DiagnosticResponseSchema<WordUpsertResponseSchema>>, Error> {
    let mut responses: Vec<DiagnosticResponseSchema<WordUpsertResponseSchema>> = Vec::new();

    for word in words {
        let mut created = false;
        let mut updated = false;
        let mut data = WordUpsertResponseSchema::new(&word);
        let mut errors: Vec<Error> = Vec::new();

        let result: Result<Word, Error> = match word.id {
            Some(_) => {
                updated = true;
                _update(database, word, &mut errors).await
            }
            None => {
                created = true;
                _create(database, word, &mut errors).await
            }
        };

        match result {
            Ok(w) => {
                data.id = Some(w.id);
            }
            Err(e) => {
                created = false;
                updated = false;
                errors.push(e);
            }
        };

        data.status.created = created;
        data.status.updated = updated;

        responses.push(DiagnosticResponseSchema { data, errors })
    }

    Ok(responses)
}

async fn _create<C>(con: &C, word: WordUpsertSchema, errors: &mut Vec<Error>) -> Result<Word, Error>
where
    C: ConnectionTrait,
{
    if word.language_id.is_none() {
        return Err(ErrorBuilder::new()
            .msg("Language ID of new word cannot be none.")
            .entity(WORD)
            .attribute("language_id")
            .invalid());
    } else if word.word_type.is_none() {
        return Err(ErrorBuilder::new()
            .msg("Type of new word cannot be none.")
            .entity(WORD)
            .attribute("word_type")
            .with_optional_value(&word.word_type)
            .invalid());
    }

    let translations = match _serialize_translations(&word.translations) {
        Ok(t) => t,
        Err(e) => {
            errors.push(e);
            None
        }
    };

    return word_manager::insert(
        con,
        word.language_id.unwrap(),
        word.word_type.unwrap(),
        word.spelling,
        word.definition,
        translations,
    )
    .await
    .map_err(|e| {
        ErrorBuilder::new()
            .msg("Word not created.")
            .from_err(e)
            .entity(WORD)
            .not_created()
    });
}

async fn _update<C>(con: &C, word: WordUpsertSchema, errors: &mut Vec<Error>) -> Result<Word, Error>
where
    C: ConnectionTrait,
{
    if word.id.is_none() {
        return Err(ErrorBuilder::new()
            .msg("Word ID cannot be none.")
            .entity(WORD)
            .attribute("id")
            .with_optional_value(&word.id)
            .invalid());
    }

    let translations = match _serialize_translations(&word.translations) {
        Ok(t) => t,
        Err(e) => {
            errors.push(e);
            None
        }
    };

    word_manager::update(
        con,
        word.id.unwrap(),
        word.language_id,
        word.word_type,
        word.spelling,
        word.definition,
        translations,
    )
    .await
    .map_err(|e| {
        ErrorBuilder::new()
            .msg("Word not updated.")
            .from_err(e)
            .entity(WORD)
            .with_optional_id(&word.id)
            .not_updated()
    })
}

pub fn _serialize_translations(
    translations: &Option<Vec<String>>,
) -> Result<Option<serde_json::Value>, Error> {
    match translations {
        Some(t) => match serde_json::to_value(t) {
            Ok(_t) => Ok(Some(_t)),
            Err(e) => Err(ErrorBuilder::new()
                .msg("Failed to serialize word translations.")
                .from_err(e)
                .entity(WORD)
                .attribute("translations")
                .not_updated()),
        },
        None => Ok(None),
    }
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<WordResponseSchema, Error> {
    let word = word_manager::get(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query the word table while fetching a word by ID.")
            .from_err(e)
            .db()
            .query_failed()
    })?;
    match word {
        Some(word) => Ok(generate_response(&word)?),
        None => Err(ErrorBuilder::new()
            .msg("Word not found")
            .entity(WORD)
            .with_id(id)
            .not_found()),
    }
}

pub async fn get_all_for_language(
    database: &DatabaseConnection,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<WordResponseSchema>, Error> {
    let words = word_manager::get_all_for_language(database, language_id, word_type)
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to query the word table while fetching all words.")
                .from_err(e)
                .db()
                .query_failed()
        })?;

    let mut word_responses: Vec<WordResponseSchema> = Vec::new();
    for word in words.iter() {
        let word_response = match generate_response(word) {
            Ok(w) => w,
            Err(e) => return Err(e),
        };
        word_responses.push(word_response);
    }

    Ok(word_responses)
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), Error> {
    word_manager::delete(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Word not deleted.")
            .from_err(e)
            .entity(WORD)
            .with_id(id)
            .not_deleted()
    })?;
    Ok(())
}

fn generate_response(word: &Word) -> Result<WordResponseSchema, Error> {
    Ok(WordResponseSchema {
        id: word.id,
        language_id: word.language_id,
        word_type: WordType::from(word.word_type),
        spelling: word.spelling.to_string(),
        definition: word.definition.to_string(),
        translations: _convert_translations_to_vec(word.id, &word.translations)?,
    })
}

fn _convert_translations_to_vec(
    id: i32,
    translations: &serde_json::Value,
) -> Result<Vec<String>, Error> {
    let generic_array = match translations.as_array() {
        Some(array) => array,
        None => {
            return Err(ErrorBuilder::new()
                .msg("Failed to deserialize word translations into a vector.")
                .entity(WORD)
                .with_id(id)
                .attribute("translations")
                .invalid());
        }
    };

    let mut array: Vec<String> = Vec::new();
    for value in generic_array.iter() {
        let str_value = match value.as_str() {
            Some(v) => v.to_string(),
            None => {
                return Err(ErrorBuilder::new()
                    .msg("Failed to deserialize word translation into a string.")
                    .entity(WORD)
                    .with_id(id)
                    .attribute("translations")
                    .invalid());
            }
        };
        array.push(str_value);
    }

    Ok(array)
}

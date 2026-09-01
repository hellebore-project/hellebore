use rstest::*;
use uuid::Uuid;

use hellebore::{
    schema::{
        entry::EntryCreateSchema,
        word::{WordResponseSchema, WordUpsertSchema},
    },
    services::{entry_service, word_service},
};

use crate::{
    fixtures::{
        database,
        language::create_language_payload,
        word::{create_word_payload, expected_word_response},
    },
    utils::{db::upsert_word, validation::validate_word_response},
};

#[rstest]
#[tokio::test]
async fn test_get_word(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let id = upsert_word(&db, &create_word_payload).await.unwrap();

    let word = word_service::get(&db, id).await;

    assert!(word.is_ok());
    let word = word.unwrap();

    expected_word_response.id = id;
    expected_word_response.language_id = language.id;

    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_nonexistent_word() {
    let database = database().await;
    let response = word_service::get(&database, Uuid::new_v4()).await;
    assert!(response.is_err());
}

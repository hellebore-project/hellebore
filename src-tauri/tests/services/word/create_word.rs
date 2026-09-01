use rstest::*;

use hellebore::{
    database::word_manager,
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
    utils::validation::validate_word_response,
};

#[rstest]
#[tokio::test]
async fn test_create_word(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);

    let responses = word_service::bulk_upsert(&db, vec![create_word_payload.clone()]).await;
    assert!(responses.is_ok());

    let responses = responses.unwrap();
    assert_eq!(responses.len(), 1);

    let response = responses.first().unwrap();
    assert!(response.data.id.is_some());
    assert!(response.data.status.created);
    assert!(!response.data.status.updated);
    assert!(response.errors.is_empty());

    let id = response.data.id.unwrap();
    let word = word_service::get(&db, id).await.unwrap();

    expected_word_response.id = id;
    expected_word_response.language_id = language.id;
    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_create_duplicate_word(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let responses = word_service::bulk_upsert(
        &db,
        vec![create_word_payload.clone(), create_word_payload.clone()],
    )
    .await;
    assert!(responses.is_ok());

    let responses = responses.unwrap();
    assert_eq!(responses.len(), 2);

    let responses = word_service::bulk_upsert(&db, vec![create_word_payload]).await;
    assert!(responses.is_ok());

    let words = word_manager::get_all_for_language(&db, language.id, None)
        .await
        .unwrap();
    assert_eq!(words.len(), 3);
}

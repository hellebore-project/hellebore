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
async fn test_update_word(
    mut create_word_payload: WordUpsertSchema,
    create_language_payload: EntryCreateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let id = upsert_word(&db, &create_word_payload).await.unwrap();

    let new_spelling = "conducteur";
    let new_definition = "Pilot or operator of a vehicle.";
    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    let update_payload = WordUpsertSchema {
        id: Some(id),
        language_id: None,
        word_type: None,
        spelling: Some(new_spelling.to_owned()),
        definition: Some(new_definition.to_owned()),
        translations: Some(new_translations.clone()),
    };

    let responses = word_service::bulk_upsert(&db, vec![update_payload.clone()]).await;
    assert!(responses.is_ok());

    let responses = responses.unwrap();
    let response = responses.first().unwrap();
    assert!(!response.data.status.created);
    assert!(response.data.status.updated);
    assert!(response.errors.is_empty());

    let word = word_service::get(&db, id).await;

    assert!(word.is_ok());
    let word = word.unwrap();

    expected_word_response.id = word.id;
    expected_word_response.language_id = word.language_id;
    expected_word_response.spelling = new_spelling.to_owned();
    expected_word_response.definition = new_definition.to_owned();
    expected_word_response.translations = new_translations;

    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_update_word_atomically(
    mut create_word_payload: WordUpsertSchema,
    create_language_payload: EntryCreateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let id = upsert_word(&db, &create_word_payload).await.unwrap();

    let new_spelling = "conducteur";
    let mut update_payload = WordUpsertSchema {
        id: Some(id),
        language_id: None,
        word_type: None,
        spelling: Some(new_spelling.to_owned()),
        definition: None,
        translations: None,
    };

    let _ = word_service::bulk_upsert(&db, vec![update_payload.clone()]).await;
    let word = word_service::get(&db, id).await.unwrap();

    expected_word_response.id = word.id;
    expected_word_response.language_id = word.language_id;
    expected_word_response.spelling = new_spelling.to_owned();
    validate_word_response(&word, &expected_word_response);

    let new_definition = "Pilot or operator of a vehicle.";
    update_payload.definition = Some(new_definition.to_owned());

    let _ = word_service::bulk_upsert(&db, vec![update_payload.clone()]).await;
    let word = word_service::get(&db, id).await.unwrap();

    expected_word_response.definition = new_definition.to_owned();
    validate_word_response(&word, &expected_word_response);

    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    update_payload.translations = Some(new_translations.clone());

    let _ = word_service::bulk_upsert(&db, vec![update_payload.clone()]).await;
    let word = word_service::get(&db, id).await.unwrap();

    expected_word_response.translations = new_translations;
    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_word(create_language_payload: EntryCreateSchema) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let new_spelling = "conducteur";
    let new_definition = "Pilot or operator of a vehicle.";
    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    let update_payload = WordUpsertSchema {
        id: Some(Uuid::new_v4()),
        language_id: Some(language.id),
        word_type: None,
        spelling: Some(new_spelling.to_owned()),
        definition: Some(new_definition.to_owned()),
        translations: Some(new_translations.clone()),
    };

    let responses = word_service::bulk_upsert(&db, vec![update_payload.clone()]).await;
    assert!(responses.is_ok());

    let responses = responses.unwrap();
    let response = responses.first().unwrap();
    assert!(!response.errors.is_empty())
}

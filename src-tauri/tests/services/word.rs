use rstest::*;
use uuid::Uuid;

use hellebore::{
    database::{language_manager, word_manager},
    schema::{
        common::PaginatedResponseSchema,
        entry::EntryCreateSchema,
        word::{WordQuerySchema, WordResponseSchema, WordUpsertSchema},
    },
    services::{entry_service, word_service},
    types::grammar::WordType,
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

#[rstest]
#[tokio::test]
async fn test_get_paginated_words_for_a_language(create_language_payload: EntryCreateSchema) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let payloads = [
        WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Noun),
            spelling: Some("beta".to_owned()),
            translations: Some(vec!["two".to_owned()]),
            ..Default::default()
        },
        WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Verb),
            spelling: Some("alpha".to_owned()),
            translations: Some(vec!["one".to_owned()]),
            ..Default::default()
        },
        WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Adjective),
            spelling: Some("gamma".to_owned()),
            translations: Some(vec!["three".to_owned()]),
            ..Default::default()
        },
    ];

    for payload in payloads {
        upsert_word(&db, &payload).await.unwrap();
    }

    let response: PaginatedResponseSchema<WordResponseSchema> = word_service::get_languages_page(
        &db,
        WordQuerySchema {
            language_id: language.id,
            page_index: 2,
            per_page: 1,
            word_types: None,
            spelling: None,
            definition: None,
            translations: None,
        },
    )
    .await
    .unwrap();

    assert_eq!(response.page_index, 2);
    assert_eq!(response.items_per_page_count, 1);
    assert_eq!(response.total_item_count, 3);
    assert_eq!(response.total_page_count, 3);
    assert_eq!(response.data.len(), 1);
    assert_eq!(response.data[0].spelling, "beta");
}

#[rstest]
#[tokio::test]
async fn test_get_paginated_words_with_filters(create_language_payload: EntryCreateSchema) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let matching_word = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        definition: Some("to guide a vehicle".to_owned()),
        translations: Some(vec!["drive".to_owned(), "steer".to_owned()]),
        ..Default::default()
    };
    let non_matching_word = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Noun),
        spelling: Some("route".to_owned()),
        definition: Some("roadway".to_owned()),
        translations: Some(vec!["street".to_owned()]),
        ..Default::default()
    };

    upsert_word(&db, &matching_word).await.unwrap();
    upsert_word(&db, &non_matching_word).await.unwrap();

    let response = word_service::get_languages_page(
        &db,
        WordQuerySchema {
            language_id: language.id,
            page_index: 1,
            per_page: 10,
            word_types: Some(vec![WordType::Verb]),
            spelling: Some("dui".to_owned()),
            definition: Some("vehicle".to_owned()),
            translations: Some("drive".to_owned()),
        },
    )
    .await
    .unwrap();

    assert_eq!(response.total_item_count, 1);
    assert_eq!(response.total_page_count, 1);
    assert_eq!(response.data.len(), 1);
    assert_eq!(response.data[0].spelling, "conduire");
    assert_eq!(response.data[0].translations, vec!["drive", "steer"]);
}

#[rstest]
#[tokio::test]
async fn test_delete_word(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let id = upsert_word(&db, &create_word_payload).await.unwrap();

    let response = word_service::delete(&db, id).await;
    assert!(response.is_ok());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_word() {
    let database = database().await;
    let response = word_service::delete(&database, Uuid::new_v4()).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_all_words_deleted_on_delete_language(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
) {
    let db = database().await;

    let entry = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();
    let id = entry.id;

    create_word_payload.language_id = Some(id);
    upsert_word(&db, &create_word_payload).await.unwrap();

    let words = word_manager::get_all_for_language(&db, id, None)
        .await
        .unwrap();
    assert_eq!(words.len(), 1);

    let response = entry_service::delete(&db, entry.id).await;

    assert!(response.is_ok());

    let entry = language_manager::get(&db, entry.id).await;
    assert!(entry.is_ok());

    let entry = entry.unwrap();
    assert!(entry.is_none());

    let words = word_manager::get_all_for_language(&db, id, None)
        .await
        .unwrap();
    assert_eq!(words.len(), 0);
}

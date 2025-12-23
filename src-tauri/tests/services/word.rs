use crate::{
    fixtures::{
        database,
        language::create_language_payload,
        settings,
        word::{create_word_payload, expected_word_response},
    },
    utils::query::upsert_word,
};

use hellebore::{
    database::{language_manager, word_manager},
    schema::{
        entry::EntryCreateSchema,
        word::{WordResponseSchema, WordUpdateSchema},
    },
    services::{entry_service, word_service},
    settings::Settings,
    types::grammar::WordType,
    utils::CodedEnum,
};
use rstest::*;

fn validate_word_response(actual: &WordResponseSchema, expected: &WordResponseSchema) {
    assert_eq!(expected.id, actual.id);
    assert_eq!(expected.language_id, actual.language_id);
    assert_eq!(expected.word_type.code(), actual.word_type.code());
    assert_eq!(expected.spelling, actual.spelling);
    assert_eq!(expected.definition, actual.definition);
    assert_eq!(expected.translations, actual.translations);
}

#[rstest]
#[tokio::test]
async fn test_create_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpdateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database(settings).await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);

    let responses = word_service::bulk_upsert(&db, vec![create_word_payload.clone()]).await;
    assert!(responses.is_ok());

    let responses = responses.unwrap();
    assert_eq!(responses.len(), 1);

    let response = responses.get(0).unwrap();
    assert!(response.data.is_some());
    assert!(response.errors.is_empty());

    let id = response.data.unwrap();
    let word = word_service::get(&db, id).await.unwrap();

    expected_word_response.id = id;
    expected_word_response.language_id = language.id;
    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_create_duplicate_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpdateSchema,
) {
    let db = database(settings).await;
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
    settings: &Settings,
    mut create_word_payload: WordUpdateSchema,
    create_language_payload: EntryCreateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database(settings).await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let id = upsert_word(&db, &create_word_payload).await.unwrap();

    let new_spelling = "conducteur";
    let new_definition = "Pilot or operator of a vehicle.";
    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    let update_payload = WordUpdateSchema {
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
    let response = responses.get(0).unwrap();
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
async fn test_error_on_updating_nonexistent_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
) {
    let db = database(settings).await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let new_spelling = "conducteur";
    let new_definition = "Pilot or operator of a vehicle.";
    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    let update_payload = WordUpdateSchema {
        id: Some(1),
        language_id: Some(language.id),
        word_type: None,
        spelling: Some(new_spelling.to_owned()),
        definition: Some(new_definition.to_owned()),
        translations: Some(new_translations.clone()),
    };

    let responses = word_service::bulk_upsert(&db, vec![update_payload.clone()]).await;
    assert!(responses.is_ok());

    let responses = responses.unwrap();
    let response = responses.get(0).unwrap();
    assert!(!response.errors.is_empty())
}

#[rstest]
#[tokio::test]
async fn test_get_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpdateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let db = database(settings).await;
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
async fn test_error_on_getting_nonexistent_word(settings: &Settings) {
    let database = database(settings).await;
    let response = word_service::get(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_all_words_for_a_language(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
) {
    let db = database(settings).await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let create_payload_1 = WordUpdateSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Noun),
        spelling: Some("rue".to_owned()),
        translations: Some(vec!["road".to_owned()]),
        ..Default::default()
    };
    let id_1 = upsert_word(&db, &create_payload_1).await.unwrap();

    let create_payload_2 = WordUpdateSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        translations: Some(vec!["drive".to_owned()]),
        ..Default::default()
    };
    let id_2 = upsert_word(&db, &create_payload_2).await.unwrap();

    let words = word_service::get_all_for_language(&db, language.id, None).await;

    assert!(words.is_ok());
    let mut words = words.unwrap();
    words.sort_by(|a, b| a.id.cmp(&b.id));

    let mut expected_response_1 = create_payload_1.to_response();
    expected_response_1.id = id_1;
    expected_response_1.language_id = language.id;

    let mut expected_response_2 = create_payload_2.to_response();
    expected_response_2.id = id_2;
    expected_response_2.language_id = language.id;

    validate_word_response(&words[0], &expected_response_1);
    validate_word_response(&words[1], &expected_response_2);
}

#[rstest]
#[tokio::test]
async fn test_delete_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpdateSchema,
) {
    let db = database(settings).await;
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
async fn test_error_on_deleting_nonexistent_word(settings: &Settings) {
    let database = database(settings).await;
    let response = word_service::delete(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_all_words_deleted_on_delete_language(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpdateSchema,
) {
    let db = database(settings).await;

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

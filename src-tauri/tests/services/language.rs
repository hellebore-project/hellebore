use rstest::*;

use hellebore::{
    database::language_manager,
    schema::{
        entry::{EntryCreateSchema, EntryUpdateSchema},
        word::{WordResponseSchema, WordUpsertSchema},
    },
    services::{entry_service, word_service},
    settings::Settings,
    types::entity::LANGUAGE,
};

use crate::{
    fixtures::{
        database,
        entry::update_entry_payload,
        folder::folder_id,
        language::{create_language_payload, language_name},
        settings,
        word::{create_word_payload, expected_word_response, update_word_payload},
    },
    utils::{
        query::{get_entry, upsert_word},
        validation::{
            validate_entry_info_response, validate_entry_model,
            validate_language_property_response, validate_word_response,
        },
    },
};

#[rstest]
#[tokio::test]
async fn test_create_language(
    settings: &Settings,
    folder_id: i32,
    language_name: String,
    create_language_payload: EntryCreateSchema,
) {
    let db = database(settings).await;
    let entry = entry_service::create(&db, create_language_payload).await;

    assert!(entry.is_ok());
    validate_entry_info_response(&entry.unwrap(), None, folder_id, LANGUAGE, &language_name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_duplicate_language(
    settings: &Settings,
    create_language_payload: EntryCreateSchema,
) {
    let db = database(settings).await;
    let _ = entry_service::create(&db, create_language_payload.clone()).await;
    let response = entry_service::create(&db, create_language_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_language(
    settings: &Settings,
    folder_id: i32,
    language_name: String,
    create_language_payload: EntryCreateSchema,
) {
    let db = database(settings).await;
    let entry = entry_service::create(&db, create_language_payload).await;

    assert!(entry.is_ok());
    let entry = entry.unwrap();

    let language = entry_service::get_properties(&db, entry.id).await;

    assert!(language.is_ok());
    let language = language.unwrap();

    validate_language_property_response(
        &language,
        Some(entry.id),
        folder_id,
        LANGUAGE,
        &language_name,
    );
}

#[rstest]
#[tokio::test]
async fn test_update_language_entry(
    settings: &Settings,
    folder_id: i32,
    create_language_payload: EntryCreateSchema,
    mut update_entry_payload: EntryUpdateSchema,
    mut create_word_payload: WordUpsertSchema,
    mut update_word_payload: WordUpsertSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::create(&database, create_language_payload)
        .await
        .unwrap();

    update_entry_payload.id = entry.id;

    let modified_title = "Spanish".to_owned();
    update_entry_payload.title = Some(modified_title.clone());

    let modified_text = "A language spoken in Spain and Latin America".to_owned();
    update_entry_payload.text = Some(modified_text.clone());

    create_word_payload.language_id = Some(entry.id);
    let word_1_id = upsert_word(&database, &create_word_payload).await;
    let word_1_id = word_1_id.unwrap();

    update_word_payload.id = Some(word_1_id);
    update_word_payload.language_id = Some(entry.id);

    let mut create_word_payload_2 = create_word_payload.clone();
    let word_2_spelling = "word-2".to_owned();
    create_word_payload_2.spelling = Some(word_2_spelling.clone());

    update_entry_payload.words = Some(vec![update_word_payload.clone(), create_word_payload_2]);

    let response = entry_service::update(&database, update_entry_payload).await;

    assert_eq!(response.data.words.len(), 2);

    let word_response_1 = &response.data.words[0];
    assert_eq!(word_response_1.id, Some(word_1_id));
    assert!(word_response_1.status.updated);

    let word_response_2 = &response.data.words[1];
    let word_2_id = word_response_2.id.unwrap();
    assert!(word_response_2.status.created);

    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await.unwrap();
    validate_entry_model(&entry, None, folder_id, &modified_title, &modified_text);

    expected_word_response.language_id = entry.id;

    let word_1 = word_service::get(&database, word_1_id).await.unwrap();
    let mut word_1_expected = expected_word_response.clone();
    word_1_expected.id = word_1_id;
    word_1_expected.spelling = update_word_payload.spelling.unwrap();
    validate_word_response(&word_1, &word_1_expected);

    let word_2 = word_service::get(&database, word_2_id).await.unwrap();
    let mut word_2_expected = expected_word_response.clone();
    word_2_expected.id = word_2_id;
    word_2_expected.spelling = word_2_spelling;
    validate_word_response(&word_2, &word_2_expected);
}

#[rstest]
#[tokio::test]
async fn test_delete_language(settings: &Settings, create_language_payload: EntryCreateSchema) {
    let db = database(settings).await;

    let entry = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let response = entry_service::delete(&db, entry.id).await;

    assert!(response.is_ok());

    let language = language_manager::get(&db, entry.id).await;
    assert!(language.is_ok());

    let language = language.unwrap();
    assert!(language.is_none());
}

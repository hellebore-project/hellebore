use rstest::*;

use hellebore::{
    database::language_manager,
    schema::{entry::EntryCreateSchema, language::LanguageDataSchema, word::WordUpdateSchema},
    services::{language_service, word_service},
    settings::Settings,
};

use crate::fixtures::{
    database,
    folder::folder_id,
    language::{create_language_payload, language_name},
    settings,
    word::create_word_payload,
};
use crate::utils::{entry::validate_entry_info_response, word::get_all_words_for_language};

#[rstest]
#[tokio::test]
async fn test_create_language(
    settings: &Settings,
    folder_id: i32,
    language_name: String,
    create_language_payload: EntryCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let entry = language_service::create(&database, create_language_payload).await;

    assert!(entry.is_ok());
    validate_entry_info_response(&entry.unwrap(), None, folder_id, &language_name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_duplicate_language(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let _ = language_service::create(&database, create_language_payload.clone()).await;
    let response = language_service::create(&database, create_language_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_delete_language(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageDataSchema>,
    mut create_word_payload: WordUpdateSchema,
) {
    let database = database(settings).await;

    let entry = language_service::create(&database, create_language_payload)
        .await
        .unwrap();
    let id = entry.id;

    create_word_payload.language_id = Some(id);
    let _ = word_service::create(&database, create_word_payload.clone()).await;

    let words = get_all_words_for_language(id, &database).await;
    assert_eq!(words.len(), 1);

    let response = language_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = language_manager::get(&database, entry.id).await;
    assert!(entry.is_ok());

    let entry = entry.unwrap();
    assert!(entry.is_none());

    let words = get_all_words_for_language(id, &database).await;
    assert_eq!(words.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_language(settings: &Settings) {
    let database = database(settings).await;
    let response = language_service::delete(&database, 0).await;
    assert!(response.is_err());
}

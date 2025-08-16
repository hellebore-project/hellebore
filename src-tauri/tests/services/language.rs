use hellebore::{
    database::language_manager,
    schema::{entry::EntryCreateSchema, language::LanguageDataSchema},
    services::language_service,
    settings::Settings,
};
use rstest::*;

use crate::fixtures::{create_language_payload, database, folder_id, language_name, settings};
use crate::utils::validate_entry_info_response;

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
) {
    let database = database(settings).await;
    let entry = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    let response = language_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = language_manager::get(&database, entry.id).await;
    assert!(entry.is_ok());
    assert!(entry.unwrap().is_none());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_language(settings: &Settings) {
    let database = database(settings).await;
    let response = language_service::delete(&database, 0).await;
    assert!(response.is_err());
}

use rstest::*;

use hellebore::{
    database::language_manager, schema::entry::EntryCreateSchema, services::entry_service,
    settings::Settings, types::entity::LANGUAGE,
};

use crate::fixtures::{
    database,
    folder::folder_id,
    language::{create_language_payload, language_name},
    settings,
};
use crate::utils::validation::{validate_entry_info_response, validate_language_property_response};

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
async fn test_delete_language(settings: &Settings, create_language_payload: EntryCreateSchema) {
    let db = database(settings).await;

    let entry = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let response = entry_service::delete(&db, entry.id).await;

    assert!(response.is_ok());

    let entry = language_manager::get(&db, entry.id).await;
    assert!(entry.is_ok());

    let entry = entry.unwrap();
    assert!(entry.is_none());
}

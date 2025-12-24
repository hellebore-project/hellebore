use ::entity::entry::Model as EntryModel;
use hellebore::{
    database::file_manager,
    schema::{
        entry::{EntryInfoResponseSchema, EntryUpdateSchema},
        folder::FolderCreateSchema,
    },
    services::{entry_service, folder_service},
    settings::Settings,
    types::entity::ENTRY,
};
use rstest::*;

use crate::{
    fixtures::{
        database,
        entry::{entry_text, update_entry_payload},
        folder::{folder_create_payload, folder_id},
        settings,
    },
    utils::query::get_entry,
};

fn validate_model(entry: &EntryModel, id: Option<i32>, folder_id: i32, title: &str, text: &str) {
    if id.is_some() {
        assert_eq!(id.unwrap(), entry.id);
    }
    assert_eq!(
        folder_id,
        file_manager::convert_null_folder_id_to_root(entry.folder_id)
    );
    assert_eq!(title, entry.title);
    assert_eq!(text, entry.text);
}

fn validate_info_response(
    entry: &EntryInfoResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), entry.id);
    }
    assert_eq!(folder_id, entry.folder_id);
    assert_eq!(title, entry.title);
}

#[fixture]
fn title() -> String {
    "Entry".to_string()
}

#[rstest]
#[tokio::test]
async fn test_create_entry(settings: &Settings, folder_id: i32, title: String, entry_text: String) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title.to_owned(),
        entry_text.to_owned(),
    )
    .await;

    assert!(entry.is_ok());
    let entry = entry.unwrap();
    validate_model(&entry, None, folder_id, &title, &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_entry_with_duplicate_name(
    settings: &Settings,
    folder_id: i32,
    title: String,
    entry_text: String,
) {
    let database = database(settings).await;
    let _ = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title.to_owned(),
        entry_text.to_owned(),
    )
    .await;
    let entry = entry_service::_create(&database, ENTRY, folder_id, title, entry_text).await;
    assert!(entry.is_err());
}

#[rstest]
#[tokio::test]
async fn test_update_entry_title(
    settings: &Settings,
    folder_id: i32,
    title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::_create(&database, ENTRY, folder_id, title, entry_text.to_owned())
        .await
        .unwrap();

    update_entry_payload.id = entry.id;
    update_entry_payload.title = Some("new title".to_owned());
    let response = entry_service::update(&database, update_entry_payload).await;

    assert_eq!(response.data.id, entry.id);
    assert!(response.data.title.updated);
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await.unwrap();
    validate_model(&entry, None, folder_id, "new title", &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_update_entry_folder(
    settings: &Settings,
    folder_id: i32,
    folder_create_payload: FolderCreateSchema,
    title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title.to_owned(),
        entry_text.to_owned(),
    )
    .await
    .unwrap();
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    update_entry_payload.id = entry.id;
    update_entry_payload.folder_id = Some(folder.id);
    let response = entry_service::update(&database, update_entry_payload).await;

    assert!(response.data.folder_id.updated);
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await.unwrap();
    validate_model(&entry, None, folder.id, &title, &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_update_entry_text(
    settings: &Settings,
    folder_id: i32,
    title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::_create(&database, ENTRY, folder_id, title.to_owned(), entry_text)
        .await
        .unwrap();

    update_entry_payload.id = entry.id;
    update_entry_payload.text = Some("updated text".to_owned());
    let response = entry_service::update(&database, update_entry_payload).await;

    assert!(response.data.text.updated);
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await;
    validate_model(&entry.unwrap(), None, folder_id, &title, "updated text");
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_entry(
    settings: &Settings,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;

    update_entry_payload.title = Some("edited-title".to_owned());
    let response = entry_service::update(&database, update_entry_payload).await;

    assert!(!response.data.title.updated);
    assert!(response.errors.len() > 0);
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_entry_with_duplicate_name(
    settings: &Settings,
    folder_id: i32,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry_1 = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "entry1".to_owned(),
        entry_text.to_owned(),
    )
    .await
    .unwrap();
    let entry_2 =
        entry_service::_create(&database, ENTRY, folder_id, "entry2".to_owned(), entry_text)
            .await
            .unwrap();

    update_entry_payload.id = entry_1.id;
    update_entry_payload.title = Some(entry_2.title);
    let response = entry_service::update(&database, update_entry_payload).await;

    assert!(!response.data.title.updated);
    assert!(!response.data.title.is_unique);
    assert!(response.errors.len() > 0);

    let entry = get_entry(&database, entry_1.id).await.unwrap();
    assert_eq!(entry.title, entry_1.title);
}

#[rstest]
#[tokio::test]
async fn test_noop_on_updating_entry_with_empty_payload(
    settings: &Settings,
    update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;

    let id = update_entry_payload.id;
    let response = entry_service::update(&database, update_entry_payload).await;

    assert_eq!(response.data.id, id);
    assert!(!response.data.folder_id.updated);
    assert!(!response.data.title.updated);
    assert!(!response.data.properties.updated);
    assert!(!response.data.text.updated);
    assert!(response.errors.is_empty());
}

#[rstest]
#[tokio::test]
async fn test_get_entry(settings: &Settings, folder_id: i32, title: String, entry_text: String) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title.to_owned(),
        entry_text.to_owned(),
    )
    .await
    .unwrap();

    let entry = get_entry(&database, entry.id).await;
    validate_model(&entry.unwrap(), None, folder_id, &title, &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_nonexistent_entry(settings: &Settings) {
    let database = database(settings).await;
    let response = entry_service::get_info(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_properties_of_nonexistent_entry(settings: &Settings) {
    let database = database(settings).await;
    let response = entry_service::get_properties(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
#[case("blah blah blah")]
async fn test_get_entry_text(
    settings: &Settings,
    folder_id: i32,
    title: String,
    #[case] entry_text: String,
) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title.to_owned(),
        entry_text.to_owned(),
    )
    .await
    .unwrap();

    let article = entry_service::get_text(&database, entry.id).await;

    assert!(article.is_ok());

    let article = article.unwrap();
    validate_info_response(&article.info, None, folder_id, &title);
    assert_eq!(article.text, entry_text);
}

#[rstest]
#[tokio::test]
async fn test_get_all_entries(settings: &Settings, folder_id: i32, title: String) {
    let database = database(settings).await;
    let _ = entry_service::_create(&database, ENTRY, folder_id, title.to_owned(), "".to_owned())
        .await
        .unwrap();
    let title_2 = format!("{} 2", title);
    let _ = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title_2.to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let entries = entry_service::get_all(&database).await;

    assert!(entries.is_ok());
    let mut entries = entries.unwrap();
    assert_eq!(2, entries.len());
    entries.sort_by(|a, b| a.title.cmp(&b.title));
    validate_info_response(&entries[0], None, folder_id, &title);
    validate_info_response(&entries[1], None, folder_id, &title_2);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_exact_title_match(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Rust Programming".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust Programming").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
    assert_eq!(results[0].title, "Rust Programming");
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_starts_with_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Rust Guide for Beginners".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_ends_with_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Learn Programming".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Programming").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Advanced Rust Patterns".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_does_not_contain_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let _entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Python Basics".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_partial_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    // Search for "Program" which is a partial match of "Programming"
    let results = entry_service::search(&database, "Program").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword_with_typo(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let _entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    // keyword is missing a letter
    let results = entry_service::search(&database, "Prgram").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_delete_entry(settings: &Settings, folder_id: i32, title: String, entry_text: String) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        title.to_owned(),
        entry_text.to_owned(),
    )
    .await
    .unwrap();

    let response = entry_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = get_entry(&database, entry.id).await;
    assert!(entry.is_none());
}

#[rstest]
#[tokio::test]
async fn test_noop_on_deleting_nonexistent_entry(settings: &Settings) {
    let database = database(settings).await;
    let response = entry_service::delete(&database, 0).await;
    assert!(response.is_ok());
}

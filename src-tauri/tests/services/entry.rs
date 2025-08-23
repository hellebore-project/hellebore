use ::entity::entry::Model as EntryModel;
use hellebore::{
    database::{entry_manager, folder_manager::convert_null_folder_id_to_root},
    schema::{entry::EntryInfoResponseSchema, folder::FolderCreateSchema},
    services::{entry_service, folder_service},
    settings::Settings,
    types::entity::ENTRY,
};
use rstest::*;

use crate::{
    fixtures::{
        database,
        entry::entry_text,
        folder::{folder_create_payload, folder_id},
        settings,
    },
    utils::query::get_entry,
};

fn validate_model(entry: &EntryModel, id: Option<i32>, folder_id: i32, title: &str, text: &str) {
    if id.is_some() {
        assert_eq!(id.unwrap(), entry.id);
    }
    assert_eq!(folder_id, convert_null_folder_id_to_root(entry.folder_id));
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

    let entry = entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ENTRY,
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
    let _ = entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ENTRY,
        entry_text.to_owned(),
    )
    .await;
    let entry = entry_manager::insert(&database, folder_id, title, ENTRY, entry_text).await;
    assert!(entry.is_err());
}

#[rstest]
#[tokio::test]
async fn test_update_entry_title(
    settings: &Settings,
    folder_id: i32,
    title: String,
    entry_text: String,
) {
    let database = database(settings).await;
    let entry = entry_manager::insert(&database, folder_id, title, ENTRY, entry_text.to_owned())
        .await
        .unwrap();

    let response = entry_service::update_title(&database, entry.id, "new title".to_owned()).await;

    assert!(response.is_ok());

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
) {
    let database = database(settings).await;
    let entry = entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ENTRY,
        entry_text.to_owned(),
    )
    .await
    .unwrap();
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    let response = entry_service::update_folder(&database, entry.id, folder.id).await;

    assert!(response.is_ok());

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
) {
    let database = database(settings).await;
    let entry = entry_manager::insert(&database, folder_id, title.to_owned(), ENTRY, entry_text)
        .await
        .unwrap();

    let response = entry_service::update_text(&database, entry.id, "updated text".to_owned()).await;

    assert!(response.is_ok());

    let entry = get_entry(&database, entry.id).await;
    validate_model(&entry.unwrap(), None, folder_id, &title, "updated text");
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_title_of_nonexistent_entry(settings: &Settings) {
    let database = database(settings).await;
    let response = entry_service::update_title(&database, 0, "".to_owned()).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_folder_of_nonexistent_entry(settings: &Settings) {
    let database = database(settings).await;
    let response = entry_service::update_folder(&database, 0, -1).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_text_of_nonexistent_entry(settings: &Settings) {
    let database = database(settings).await;
    let response = entry_service::update_text(&database, 0, "".to_owned()).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_entry_with_duplicate_name(
    settings: &Settings,
    folder_id: i32,
    entry_text: String,
) {
    let database = database(settings).await;
    let entry_1 = entry_manager::insert(
        &database,
        folder_id,
        "entry1".to_owned(),
        ENTRY,
        entry_text.to_owned(),
    )
    .await
    .unwrap();
    let entry_2 =
        entry_manager::insert(&database, folder_id, "entry2".to_owned(), ENTRY, entry_text)
            .await
            .unwrap();

    let response = entry_service::update_title(&database, entry_1.id, entry_2.title).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_entry(settings: &Settings, folder_id: i32, title: String, entry_text: String) {
    let database = database(settings).await;
    let entry = entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ENTRY,
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
    let entry = entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ENTRY,
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
    let _ = entry_manager::insert(&database, folder_id, title.to_owned(), ENTRY, "".to_owned())
        .await
        .unwrap();
    let title_2 = format!("{} 2", title);
    let _ = entry_manager::insert(
        &database,
        folder_id,
        title_2.to_owned(),
        ENTRY,
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
async fn test_delete_entry(settings: &Settings, folder_id: i32, title: String, entry_text: String) {
    let database = database(settings).await;
    let entry = entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ENTRY,
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

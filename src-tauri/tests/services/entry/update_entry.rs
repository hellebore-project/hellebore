use hellebore::{
    schema::{entry::EntryUpdateSchema, folder::FolderCreateSchema},
    services::{entry_service, folder_service},
    settings::Settings,
};
use rstest::*;

use crate::{
    fixtures::{
        database,
        entry::{entry_text, entry_title, update_entry_payload},
        folder::{folder_create_payload, folder_id},
        settings,
    },
    utils::{
        db::{create_generic_entry, get_entry},
        validation::validate_entry_model,
    },
};

#[rstest]
#[tokio::test]
async fn test_update_entry_title(
    settings: &Settings,
    folder_id: i32,
    entry_title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry =
        create_generic_entry(&database, folder_id, entry_title, entry_text.to_owned()).await;

    update_entry_payload.id = entry.id;
    update_entry_payload.title = Some("new title".to_owned());
    let response = entry_service::update(&database, update_entry_payload).await;

    assert_eq!(response.data.id, entry.id);
    assert!(!response.data.folder_id.updated);
    assert!(response.data.title.updated);
    assert!(!response.data.text.updated);
    assert!(response.data.words.is_empty());
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await.unwrap();
    validate_entry_model(&entry, None, folder_id, "new title", &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_update_entry_folder(
    settings: &Settings,
    folder_id: i32,
    folder_create_payload: FolderCreateSchema,
    entry_title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();
    let entry = create_generic_entry(
        &database,
        folder_id,
        entry_title.to_owned(),
        entry_text.to_owned(),
    )
    .await;

    update_entry_payload.id = entry.id;
    update_entry_payload.folder_id = Some(folder.id);
    let response = entry_service::update(&database, update_entry_payload).await;

    assert!(response.data.folder_id.updated);
    assert!(!response.data.title.updated);
    assert!(!response.data.text.updated);
    assert!(response.data.words.is_empty());
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await.unwrap();
    validate_entry_model(&entry, None, folder.id, &entry_title, &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_update_entry_text(
    settings: &Settings,
    folder_id: i32,
    entry_title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry =
        create_generic_entry(&database, folder_id, entry_title.to_owned(), entry_text).await;

    update_entry_payload.id = entry.id;
    update_entry_payload.text = Some("updated text".to_owned());
    let response = entry_service::update(&database, update_entry_payload).await;

    assert!(!response.data.folder_id.updated);
    assert!(!response.data.title.updated);
    assert!(response.data.text.updated);
    assert!(response.data.words.is_empty());
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await;
    validate_entry_model(
        &entry.unwrap(),
        None,
        folder_id,
        &entry_title,
        "updated text",
    );
}

#[rstest]
#[tokio::test]
async fn test_update_entry(
    settings: &Settings,
    folder_id: i32,
    folder_create_payload: FolderCreateSchema,
    entry_title: String,
    entry_text: String,
    mut update_entry_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();
    let entry =
        create_generic_entry(&database, folder_id, entry_title, entry_text.to_owned()).await;

    update_entry_payload.id = entry.id;
    update_entry_payload.folder_id = Some(folder.id);
    update_entry_payload.title = Some("new title".to_owned());
    update_entry_payload.text = Some("updated text".to_owned());
    let response = entry_service::update(&database, update_entry_payload).await;

    assert_eq!(response.data.id, entry.id);
    assert!(response.data.folder_id.updated);
    assert!(response.data.title.updated);
    assert!(response.data.text.updated);
    assert!(response.data.words.is_empty());
    assert!(response.errors.is_empty());

    let entry = get_entry(&database, entry.id).await.unwrap();
    validate_entry_model(&entry, None, folder.id, "new title", "updated text");
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

    let entry_1 = create_generic_entry(
        &database,
        folder_id,
        "entry1".to_owned(),
        entry_text.to_owned(),
    )
    .await;

    let entry_2 = create_generic_entry(&database, folder_id, "entry2".to_owned(), entry_text).await;

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

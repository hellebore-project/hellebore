use hellebore::{
    model::text::TextNode, services::entry_service, settings::Settings, types::entity::ENTRY,
};
use rstest::*;

use crate::{
    fixtures::{
        database,
        entry::{entry_text, entry_text_json, entry_text_node, entry_title},
        folder::folder_id,
        settings,
    },
    utils::{
        query::get_entry,
        validation::{validate_entry_model, validate_generic_entry_info_response},
    },
};

#[rstest]
#[tokio::test]
async fn test_get_entry(
    settings: &Settings,
    folder_id: i32,
    entry_title: String,
    entry_text: String,
) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        entry_title.to_owned(),
        entry_text.to_owned(),
    )
    .await
    .unwrap();

    let entry = get_entry(&database, entry.id).await;
    validate_entry_model(&entry.unwrap(), None, folder_id, &entry_title, &entry_text);
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
async fn test_get_entry_text(
    settings: &Settings,
    folder_id: i32,
    entry_title: String,
    entry_text_node: TextNode,
    entry_text_json: String,
) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        entry_title.to_owned(),
        entry_text_json.to_owned(),
    )
    .await
    .unwrap();

    let response = entry_service::get_text(&database, entry.id).await;

    assert!(response.is_ok());

    let diagnostic_response = response.unwrap();
    assert!(diagnostic_response.errors.is_empty());

    let article = diagnostic_response.data;
    validate_generic_entry_info_response(&article.info, None, folder_id, &entry_title);
    assert_eq!(article.text, entry_text_node);
}

#[rstest]
#[tokio::test]
async fn test_get_all_entries(settings: &Settings, folder_id: i32, entry_title: String) {
    let database = database(settings).await;
    let _ = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        entry_title.to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();
    let title_2 = format!("{} 2", entry_title);
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
    validate_generic_entry_info_response(&entries[0], None, folder_id, &entry_title);
    validate_generic_entry_info_response(&entries[1], None, folder_id, &title_2);
}

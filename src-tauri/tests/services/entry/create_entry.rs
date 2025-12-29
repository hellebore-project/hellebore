use hellebore::{services::entry_service, settings::Settings, types::entity::ENTRY};
use rstest::*;

use crate::{
    fixtures::{
        database,
        entry::{entry_text, entry_title},
        folder::folder_id,
        settings,
    },
    utils::validation::validate_entry_model,
};

#[rstest]
#[tokio::test]
async fn test_create_entry(
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
    .await;

    assert!(entry.is_ok());
    let entry = entry.unwrap();
    validate_entry_model(&entry, None, folder_id, &entry_title, &entry_text);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_entry_with_duplicate_name(
    settings: &Settings,
    folder_id: i32,
    entry_title: String,
    entry_text: String,
) {
    let database = database(settings).await;
    let _ = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        entry_title.to_owned(),
        entry_text.to_owned(),
    )
    .await;
    let entry = entry_service::_create(&database, ENTRY, folder_id, entry_title, entry_text).await;
    assert!(entry.is_err());
}

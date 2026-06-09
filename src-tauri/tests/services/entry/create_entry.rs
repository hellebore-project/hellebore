use hellebore::{model::config::AppConfig, services::entry_service, types::entity::ENTRY};
use rstest::*;

use crate::{
    fixtures::{
        config, database,
        entry::{entry_text, entry_title},
        folder::folder_id,
    },
    utils::validation::validate_entry_model,
};

#[rstest]
#[tokio::test]
async fn test_create_entry(
    config: &AppConfig,
    folder_id: i32,
    entry_title: String,
    entry_text: String,
) {
    let database = database(config).await;

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
    config: &AppConfig,
    folder_id: i32,
    entry_title: String,
    entry_text: String,
) {
    let database = database(config).await;
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

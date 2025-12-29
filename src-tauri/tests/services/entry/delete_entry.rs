use hellebore::{services::entry_service, settings::Settings, types::entity::ENTRY};
use rstest::*;

use crate::{
    fixtures::{
        database,
        entry::{entry_text, entry_title},
        folder::folder_id,
        settings,
    },
    utils::query::get_entry,
};

#[rstest]
#[tokio::test]
async fn test_delete_entry(
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

use hellebore::services::entry_service;
use rstest::*;
use uuid::Uuid;

use crate::{
    fixtures::{
        database,
        entry::{entry_text, entry_title},
        folder::folder_id,
    },
    utils::db::{create_generic_entry, get_entry},
};

#[rstest]
#[tokio::test]
async fn test_delete_entry(folder_id: Uuid, entry_title: String, entry_text: String) {
    let database = database().await;
    let entry = create_generic_entry(
        &database,
        folder_id,
        entry_title.to_owned(),
        entry_text.to_owned(),
    )
    .await;

    let response = entry_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = get_entry(&database, entry.id).await;
    assert!(entry.is_none());
}

#[rstest]
#[tokio::test]
async fn test_noop_on_deleting_nonexistent_entry() {
    let database = database().await;
    let response = entry_service::delete(&database, Uuid::new_v4()).await;
    assert!(response.is_ok());
}

use hellebore::{
    model::text::TextNode,
    services::{entry_service, entry_text_service},
    settings::Settings,
    types::entity::ENTRY,
};
use rstest::*;

use crate::fixtures::{database, entry::entry_text_node, folder::folder_id, settings};

#[rstest]
#[tokio::test]
async fn test_sync_basic_text(
    settings: &Settings,
    #[with("text".to_owned())] entry_text_node: TextNode,
) {
    let database = database(settings).await;

    let expected_text_node = entry_text_node.clone();

    let entry_text_json = serde_json::to_string(&entry_text_node.clone()).unwrap();
    let synced_text_node = entry_text_service::sync_text(&database, &entry_text_json).await;

    assert_eq!(expected_text_node, synced_text_node);
}

#[rstest]
#[tokio::test]
async fn test_sync_text_with_reference(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;
    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "new title".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let mut entry_text_node = TextNode::new_doc();
    let par = entry_text_node.add_child(TextNode::new_paragraph());
    par.add_child(TextNode::new_reference(entry.id, "old title".to_owned()));

    let entry_text_json = serde_json::to_string(&entry_text_node).unwrap();
    let synced_text_node = entry_text_service::sync_text(&database, &entry_text_json).await;

    let mut expected_text_node = TextNode::new_doc();
    let par = expected_text_node.add_child(TextNode::new_paragraph());
    par.add_child(TextNode::new_reference(entry.id, "new title".to_owned()));

    assert_eq!(expected_text_node, synced_text_node);
}

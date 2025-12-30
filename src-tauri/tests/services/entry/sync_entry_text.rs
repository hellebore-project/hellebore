use hellebore::{
    model::{errors::api_error::ApiError, text::TextNode},
    services::{entry_service, entry_text_service},
    settings::Settings,
    types::entity::ENTRY,
};
use rstest::*;
use serde_json::Value;

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
    let mut errors: Vec<ApiError> = Vec::new();

    let synced_text_node =
        entry_text_service::sync_text(&database, &entry_text_json, &mut errors).await;

    assert_eq!(expected_text_node, synced_text_node);
}

#[rstest]
#[tokio::test]
async fn test_sync_empty_text(settings: &Settings) {
    let database = database(settings).await;

    let mut errors: Vec<ApiError> = Vec::new();

    let synced_text_node =
        entry_text_service::sync_text(&database, &"".to_string(), &mut errors).await;

    assert_eq!(TextNode::new_doc(), synced_text_node);
    assert!(errors.is_empty());
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
    let entry_text_node = TextNode::new_doc().with_child(
        TextNode::new_paragraph()
            .with_child(TextNode::new_reference(entry.id, "old title".to_owned())),
    );

    let entry_text_json = serde_json::to_string(&entry_text_node).unwrap();
    let mut errors: Vec<ApiError> = Vec::new();

    let synced_text_node =
        entry_text_service::sync_text(&database, &entry_text_json, &mut errors).await;

    let expected_text_node = TextNode::new_doc().with_child(
        TextNode::new_paragraph()
            .with_child(TextNode::new_reference(entry.id, "new title".to_owned())),
    );

    assert_eq!(expected_text_node, synced_text_node);
}

#[rstest]
#[tokio::test]
async fn test_sync_text_deserialization_error(settings: &Settings) {
    let database = database(settings).await;

    let invalid_json = "this is not json".to_owned();
    let mut errors: Vec<ApiError> = Vec::new();

    let synced_text_node =
        entry_text_service::sync_text(&database, &invalid_json, &mut errors).await;

    assert_eq!(TextNode::new_doc(), synced_text_node);
    assert_eq!(errors.len(), 1);
    assert!(errors[0].to_string().contains("DESERIALIZATION FAILED"));
}

#[rstest]
#[tokio::test]
async fn test_sync_text_with_missing_referenced_entry(settings: &Settings) {
    let database = database(settings).await;

    let entry_text_node = TextNode::new_doc().with_child(
        TextNode::new_paragraph()
            .with_child(TextNode::new_reference(99999, "old title".to_owned())),
    );

    let entry_text_json = serde_json::to_string(&entry_text_node).unwrap();
    let mut errors: Vec<ApiError> = Vec::new();

    let synced_text_node =
        entry_text_service::sync_text(&database, &entry_text_json, &mut errors).await;

    let expected_text_node = TextNode::new_doc().with_child(TextNode::new_paragraph().with_child(
        TextNode::new_reference(99999, "UNKNOWN REFERENCE".to_owned()),
    ));

    assert_eq!(expected_text_node, synced_text_node);
    assert_eq!(errors.len(), 1);
    assert!(
        errors[0]
            .to_string()
            .contains("Referenced entry does not exist.")
    );
}

#[rstest]
#[tokio::test]
async fn test_sync_text_with_bad_reference_id_type(settings: &Settings) {
    let database = database(settings).await;

    let mut mention = TextNode::new_reference(0, "old title".to_owned());
    // overwrite id with a non-integer value to trigger bad_value_type
    mention.set_attr("id", Value::String("not_an_int".to_owned()));

    let entry_text_node =
        TextNode::new_doc().with_child(TextNode::new_paragraph().with_child(mention));

    let entry_text_json = serde_json::to_string(&entry_text_node).unwrap();
    let mut errors: Vec<ApiError> = Vec::new();

    let _synced_text_node =
        entry_text_service::sync_text(&database, &entry_text_json, &mut errors).await;

    assert_eq!(errors.len(), 1);
    assert!(
        errors[0]
            .to_string()
            .contains("Reference ID of Mention node is not an integer.")
    );
}

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::database::entry_manager;
use crate::model::{
    errors::{Error, ErrorBuilder},
    text::TextNode,
};
use crate::types::entity::ENTRY;

pub async fn sync_text(
    database: &DatabaseConnection,
    id: Uuid,
    text: &str,
    errors: &mut Vec<Error>,
) -> TextNode {
    let mut text = match _parse_text(id, text) {
        Ok(text) => text,
        Err(e) => {
            errors.push(e);
            return TextNode::new_doc();
        }
    };

    _sync_text_node(database, id, &mut text, errors).await;

    text
}

fn _parse_text(id: Uuid, text: &str) -> Result<TextNode, Error> {
    if text.is_empty() {
        return Ok(TextNode::new_doc());
    }

    let text_result: Result<TextNode, serde_json::Error> = serde_json::from_str(text);

    match text_result {
        Ok(text) => Ok(text),
        Err(e) => Err(ErrorBuilder::new()
            .msg("Failed to deserialize entry text.")
            .from_err(e)
            .entry(ENTRY)
            .with_id(&id)
            .text_deserialization_failed()),
    }
}

async fn _sync_text_node(
    database: &DatabaseConnection,
    id: Uuid,
    node: &mut TextNode,
    errors: &mut Vec<Error>,
) {
    if node.is_type("mention") {
        _sync_reference_label(database, id, node, errors).await;
    }

    if let Some(content) = &mut node.content {
        for child_node in content.iter_mut() {
            // reminder to self: when doing a recursive async call,
            // the future needs to be allocated on the heap and pinned
            Box::pin(_sync_text_node(database, id, child_node, errors)).await;
        }
    }
}

async fn _sync_reference_label(
    database: &DatabaseConnection,
    id: Uuid,
    node: &mut TextNode,
    errors: &mut Vec<Error>,
) {
    let ref_id_option = node.get_attr("id");

    let ref_id_value = match ref_id_option {
        Some(ref_id_value) => ref_id_value,
        None => {
            errors.push(
                ErrorBuilder::new()
                    .msg("Mention node is missing a reference ID.")
                    .entry(ENTRY)
                    .with_id(&id)
                    .missing_text_attribute("id"),
            );
            return;
        }
    };

    let ref_id_string = match ref_id_value.as_str() {
        Some(ref_id) => ref_id,
        None => {
            errors.push(
                ErrorBuilder::new()
                    .msg("Reference ID of Mention node is not a string.")
                    .entry(ENTRY)
                    .with_id(&id)
                    .bad_text_value_type("id", &ref_id_value.to_string(), "Uuid"),
            );
            return;
        }
    };

    let ref_id = match Uuid::parse_str(ref_id_string) {
        Ok(uuid) => uuid,
        Err(_) => {
            errors.push(
                ErrorBuilder::new()
                    .msg("Reference ID of Mention node is not a valid UUID.")
                    .entry(ENTRY)
                    .with_id(&id)
                    .bad_reference_id(&ref_id_value),
            );
            return;
        }
    };

    let entry_result = entry_manager::get(database, ref_id).await;

    let optional_entry = match entry_result {
        Ok(optional_entry) => optional_entry,
        Err(e) => {
            node.set_attr("label", serde_json::Value::String("ERROR".to_owned()));
            errors.push(
                ErrorBuilder::new()
                    .msg("Failed to query entry table while fetching referenced entry.")
                    .from_err(e)
                    .db()
                    .query_failed(),
            );
            return;
        }
    };

    if let Some(entry) = optional_entry {
        node.set_attr("label", serde_json::Value::String(entry.title));
    } else {
        node.set_attr(
            "label",
            serde_json::Value::String("UNKNOWN REFERENCE".to_owned()),
        );
        errors.push(
            ErrorBuilder::new()
                .msg("Referenced entry does not exist.")
                .entry(ENTRY)
                .with_id(&id)
                .bad_reference_id(&ref_id),
        );
    }
}

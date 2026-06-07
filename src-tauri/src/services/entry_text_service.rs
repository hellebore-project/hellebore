use sea_orm::DatabaseConnection;

use crate::database::entry_manager;
use crate::model::{
    errors::{Error, ErrorBuilder},
    text::TextNode,
};
use crate::types::entity::ENTRY;

pub async fn sync_text(
    database: &DatabaseConnection,
    id: i32,
    text: &String,
    errors: &mut Vec<Error>,
) -> TextNode {
    let mut text = match _parse_text(id, &text) {
        Ok(text) => text,
        Err(e) => {
            errors.push(e);
            return TextNode::new_doc();
        }
    };

    _sync_text_node(database, id, &mut text, errors).await;

    text
}

fn _parse_text(id: i32, text: &str) -> Result<TextNode, Error> {
    if text.is_empty() {
        return Ok(TextNode::new_doc());
    }

    let text_result: Result<TextNode, serde_json::Error> = serde_json::from_str(&text);

    match text_result {
        Ok(text) => Ok(text),
        Err(e) => Err(ErrorBuilder::new()
            .msg("Failed to deserialize entry text.")
            .from_err(e)
            .entry(ENTRY)
            .with_id(id)
            .text_deserialization_failed()),
    }
}

async fn _sync_text_node(
    database: &DatabaseConnection,
    id: i32,
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
    id: i32,
    node: &mut TextNode,
    errors: &mut Vec<Error>,
) {
    let ref_id_option = node.get_attr("id");
    if let Some(ref_id_value) = ref_id_option {
        if let Some(ref_id) = ref_id_value.as_i64() {
            // since the DB uses 4-byte integers, we need to cast the ref ID down from 8 bytes to 4;
            // in practice, this will never lead to dataloss since the DB is responsible for creating IDs
            let ref_id: i32 = ref_id as i32;

            let entry_result = entry_manager::get(database, ref_id).await;

            match entry_result {
                Ok(optional_entry) => match optional_entry {
                    Some(entry) => {
                        node.set_attr("label", serde_json::Value::String(entry.title));
                    }
                    None => {
                        node.set_attr(
                            "label",
                            serde_json::Value::String("UNKNOWN REFERENCE".to_owned()),
                        );
                        errors.push(
                            ErrorBuilder::new()
                                .msg("Referenced entry does not exist.")
                                .entry(ENTRY)
                                .with_id(id)
                                .bad_reference_id(ref_id),
                        );
                    }
                },
                Err(e) => {
                    node.set_attr("label", serde_json::Value::String("ERROR".to_owned()));
                    errors.push(
                        ErrorBuilder::new()
                            .msg("Failed to query entry table while fetching referenced entry.")
                            .from_err(e)
                            .db()
                            .query_failed(),
                    );
                }
            }
        } else {
            errors.push(
                ErrorBuilder::new()
                    .msg("Reference ID of Mention node is not an integer.")
                    .entry(ENTRY)
                    .with_id(id)
                    .bad_text_value_type("id", &ref_id_value.to_string(), "i64"),
            );
        }
    } else {
        errors.push(
            ErrorBuilder::new()
                .msg("Mention node is missing a reference ID.")
                .entry(ENTRY)
                .with_id(id)
                .missing_text_attribute("id"),
        );
    }
}

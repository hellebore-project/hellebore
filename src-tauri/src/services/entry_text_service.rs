use sea_orm::DatabaseConnection;

use crate::database::entry_manager;
use crate::model::errors::api_error::ApiError;
use crate::model::{errors::text_error::TextError, text::TextNode};

pub async fn sync_text(
    database: &DatabaseConnection,
    text: &String,
    errors: &mut Vec<ApiError>,
) -> TextNode {
    let mut text = match _parse_text(&text) {
        Ok(text) => text,
        Err(e) => {
            errors.push(ApiError::bad_entry_text(e));
            return TextNode::new_doc();
        }
    };

    _sync_text_node(database, &mut text, errors).await;

    text
}

fn _parse_text(text: &str) -> Result<TextNode, TextError> {
    if text == "" {
        return Ok(TextNode::new_doc());
    }

    let text_result: Result<TextNode, serde_json::Error> = serde_json::from_str(&text);

    match text_result {
        Ok(text) => Ok(text),
        Err(e) => Err(TextError::deserialization_failed(
            "Failed to deserialize entry text",
            e,
        )),
    }
}

async fn _sync_text_node(
    database: &DatabaseConnection,
    node: &mut TextNode,
    errors: &mut Vec<ApiError>,
) {
    if node.is_type("mention") {
        _sync_reference_label(database, node, errors).await;
    }

    if let Some(content) = &mut node.content {
        for child_node in content.iter_mut() {
            // reminder to self: when doing a recursive async call,
            // the future needs to be allocated on the heap and pinned
            Box::pin(_sync_text_node(database, child_node, errors)).await;
        }
    }
}

async fn _sync_reference_label(
    database: &DatabaseConnection,
    node: &mut TextNode,
    errors: &mut Vec<ApiError>,
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
                        errors.push(ApiError::bad_entry_text(TextError::bad_reference_id(
                            "Referenced entry does not exist.",
                            ref_id,
                        )))
                    }
                },
                Err(e) => {
                    node.set_attr("label", serde_json::Value::String("ERROR".to_owned()));
                    errors.push(ApiError::db(
                        "Failed to query entry table while fetching referenced entry.",
                        e,
                    ));
                }
            }
        } else {
            errors.push(ApiError::bad_entry_text(TextError::bad_value_type(
                "Reference ID of Mention node is not an integer.",
                "id".to_owned(),
                ref_id_value,
                "i64".to_owned(),
            )));
        }
    } else {
        errors.push(ApiError::bad_entry_text(TextError::missing_attr(
            "Mention node is missing a reference ID.",
            "id".to_owned(),
        )));
    }
}

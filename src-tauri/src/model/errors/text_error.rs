use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum TextError {
    MissingAttr {
        msg: String,
        key: String,
    },
    BadReferenceId {
        msg: String,
        id: i32,
    },
    BadValueType {
        msg: String,
        key: String,
        value: String,
        expected_type: String,
    },
}

impl TextError {
    pub fn missing_attr<M: ToString>(msg: M, key: String) -> TextError {
        TextError::MissingAttr {
            msg: msg.to_string(),
            key,
        }
    }

    pub fn bad_reference_id<M: ToString>(msg: M, id: i32) -> TextError {
        TextError::BadReferenceId {
            msg: msg.to_string(),
            id,
        }
    }

    pub fn bad_value_type<M: ToString, V: ToString>(
        msg: M,
        key: String,
        value: V,
        expected_type: String,
    ) -> TextError {
        TextError::BadValueType {
            msg: msg.to_string(),
            key,
            value: value.to_string(),
            expected_type,
        }
    }
}

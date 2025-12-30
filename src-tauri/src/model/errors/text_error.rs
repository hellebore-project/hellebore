use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum TextError {
    DeserializationFailed {
        msg: String,
        error: String,
    },
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
    pub fn deserialization_failed<E: ToString>(msg: &str, error: E) -> TextError {
        TextError::DeserializationFailed {
            msg: msg.to_owned(),
            error: error.to_string(),
        }
    }

    pub fn missing_attr(msg: &str, key: String) -> TextError {
        TextError::MissingAttr {
            msg: msg.to_owned(),
            key,
        }
    }

    pub fn bad_reference_id(msg: &str, id: i32) -> TextError {
        TextError::BadReferenceId {
            msg: msg.to_owned(),
            id,
        }
    }

    pub fn bad_value_type<V: ToString>(
        msg: &str,
        key: String,
        value: V,
        expected_type: String,
    ) -> TextError {
        TextError::BadValueType {
            msg: msg.to_owned(),
            key,
            value: value.to_string(),
            expected_type,
        }
    }
}

impl std::fmt::Display for TextError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TextError::DeserializationFailed { msg, error } => {
                write!(f, "DESERIALIZATION FAILED. {} Error: {}", msg, error)
            }
            TextError::MissingAttr { msg, key } => {
                write!(f, "MISSING ATTR. {} Key: {}", msg, key)
            }
            TextError::BadReferenceId { msg, id } => {
                write!(f, "BAD REFERENCE ID. {} ID: {}", msg, id)
            }
            TextError::BadValueType {
                msg,
                key,
                value,
                expected_type,
            } => {
                write!(
                    f,
                    "BAD VALUE TYPE. {} Key: {}; Value: {}; Expected: {}",
                    msg, key, value, expected_type
                )
            }
        }
    }
}

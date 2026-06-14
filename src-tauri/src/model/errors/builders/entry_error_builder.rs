use crate::{model::errors::error::Error, types::entity::EntityType};

pub struct EntryErrorBuilder {
    message: String,
    error: Option<String>,
    entity_type: EntityType,
    id: String,
}

impl EntryErrorBuilder {
    pub fn new(
        message: &str,
        error: Option<String>,
        entity_type: EntityType,
        id: &impl ToString,
    ) -> Self {
        EntryErrorBuilder {
            message: message.to_owned(),
            error,
            entity_type,
            id: id.to_string(),
        }
    }

    pub fn with_id(&mut self, id: &impl ToString) -> &mut Self {
        self.id = id.to_string();
        self
    }

    pub fn unsupported_entry_type(&self) -> Error {
        Error::UnsupportedEntryType {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
        }
    }

    pub fn text_deserialization_failed(&self) -> Error {
        Error::EntryTextDeserializationFailed {
            msg: self.message.clone(),
            error: self.error.clone().unwrap_or_default(),
            id: self.id.clone(),
        }
    }

    pub fn missing_text_attribute(&self, key: &str) -> Error {
        Error::MissingEntryTextAttr {
            msg: self.message.clone(),
            id: self.id.clone(),
            key: key.to_owned(),
        }
    }

    pub fn bad_reference_id(&self, id: i32) -> Error {
        Error::BadEntryReferenceId {
            msg: self.message.clone(),
            id: self.id.clone(),
            reference_id: id,
        }
    }

    pub fn bad_text_value_type(&self, key: &str, value: &str, expected_type: &str) -> Error {
        Error::BadEntryTextValueType {
            msg: self.message.clone(),
            id: self.id.clone(),
            key: key.to_owned(),
            value: value.to_owned(),
            expected_type: expected_type.to_owned(),
        }
    }
}

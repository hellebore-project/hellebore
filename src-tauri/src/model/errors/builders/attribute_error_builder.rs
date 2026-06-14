use crate::{model::errors::error::Error, types::entity::EntityType};

pub struct AttributeErrorBuilder {
    message: String,
    error: Option<String>,
    entity_type: EntityType,
    id: String,
    key: String,
    value: String,
}

impl AttributeErrorBuilder {
    pub fn new(message: &str, error: Option<String>, entity_type: EntityType, key: &str) -> Self {
        AttributeErrorBuilder {
            message: message.to_owned(),
            error,
            entity_type,
            id: String::new(),
            key: key.to_owned(),
            value: String::new(),
        }
    }

    pub fn with_id(&mut self, id: Option<&impl ToString>) -> &mut Self {
        self.id = id.map_or(String::new(), |v| v.to_string());
        self
    }

    pub fn with_value(&mut self, value: &impl ToString) -> &mut Self {
        self.value = value.to_string();
        self
    }

    pub fn with_optional_value(&mut self, value: &Option<impl ToString>) -> &mut Self {
        if let Some(v) = value {
            self.value = v.to_string();
        }
        self
    }

    pub fn not_updated(&self) -> Error {
        Error::AttributeNotUpdated {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
            id: self.id.clone(),
            key: self.key.clone(),
        }
    }

    pub fn not_unique(&self) -> Error {
        Error::AttributeNotUnique {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
            id: if self.id.is_empty() {
                None
            } else {
                Some(self.id.clone())
            },
            key: self.key.clone(),
            value: self.value.clone(),
        }
    }

    pub fn invalid(&self) -> Error {
        Error::AttributeInvalid {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
            id: if self.id.is_empty() {
                None
            } else {
                Some(self.id.clone())
            },
            key: self.key.clone(),
            value: self.value.clone(),
        }
    }
}

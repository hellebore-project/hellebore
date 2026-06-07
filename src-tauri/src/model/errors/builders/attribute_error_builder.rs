use crate::{
    constants::ENTITY_ID_SENTINEL, model::errors::error::Error, types::entity::EntityType,
};

pub struct AttributeErrorBuilder {
    message: String,
    error: Option<String>,
    entity_type: EntityType,
    id: i32,
    key: String,
    value: String,
}

impl AttributeErrorBuilder {
    pub fn new(message: &str, error: Option<String>, entity_type: EntityType, key: &str) -> Self {
        AttributeErrorBuilder {
            message: message.to_owned(),
            error,
            entity_type,
            id: ENTITY_ID_SENTINEL,
            key: key.to_owned(),
            value: String::new(),
        }
    }

    pub fn with_id(&mut self, id: Option<i32>) -> &mut Self {
        self.id = id.unwrap_or(ENTITY_ID_SENTINEL);
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
            entity_type: self.entity_type.clone(),
            id: self.id,
            key: self.key.clone(),
        }
    }

    pub fn not_unique(&self) -> Error {
        Error::AttributeNotUnique {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type.clone(),
            id: if self.id == ENTITY_ID_SENTINEL {
                None
            } else {
                Some(self.id)
            },
            key: self.key.clone(),
            value: self.value.clone(),
        }
    }

    pub fn invalid(&self) -> Error {
        Error::AttributeInvalid {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type.clone(),
            id: if self.id == ENTITY_ID_SENTINEL {
                None
            } else {
                Some(self.id)
            },
            key: self.key.clone(),
            value: self.value.clone(),
        }
    }
}

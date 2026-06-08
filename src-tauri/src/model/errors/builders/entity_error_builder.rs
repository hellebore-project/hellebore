use crate::{
    constants::ENTITY_ID_SENTINEL,
    model::errors::{
        builders::{
            attribute_error_builder::AttributeErrorBuilder, entry_error_builder::EntryErrorBuilder,
        },
        error::Error,
    },
    types::entity::EntityType,
};

pub struct EntityErrorBuilder {
    message: String,
    error: Option<String>,
    entity_type: EntityType,
    id: i32,
}

impl EntityErrorBuilder {
    pub fn new(message: &str, error: Option<String>, entity_type: EntityType) -> Self {
        EntityErrorBuilder {
            message: message.to_owned(),
            error,
            entity_type,
            id: ENTITY_ID_SENTINEL,
        }
    }

    pub fn attribute(&self, name: &str) -> AttributeErrorBuilder {
        AttributeErrorBuilder::new(&self.message, self.error.clone(), self.entity_type, name)
    }

    pub fn entry(&self) -> EntryErrorBuilder {
        EntryErrorBuilder::new(&self.message, self.error.clone(), self.entity_type, self.id)
    }

    pub fn with_id(&mut self, id: i32) -> &mut Self {
        self.id = id;
        self
    }

    pub fn with_optional_id(&mut self, id: &Option<i32>) -> &mut Self {
        self.id = id.unwrap_or(ENTITY_ID_SENTINEL);
        self
    }

    pub fn not_created(&self) -> Error {
        Error::NotCreated {
            msg: self.message.clone(),
            entity_type: self.entity_type,
            error: self.error.clone(),
        }
    }

    pub fn not_updated(&self) -> Error {
        Error::NotUpdated {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
            id: self.id,
        }
    }

    pub fn not_found(&self) -> Error {
        Error::NotFound {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
            id: self.id,
        }
    }

    pub fn not_deleted(&self) -> Error {
        Error::NotDeleted {
            msg: self.message.clone(),
            error: self.error.clone(),
            entity_type: self.entity_type,
            id: self.id,
        }
    }
}

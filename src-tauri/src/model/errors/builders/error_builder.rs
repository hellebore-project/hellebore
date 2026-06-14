use crate::{
    model::errors::builders::{
        database_error_builder::DatabaseErrorBuilder, entity_error_builder::EntityErrorBuilder,
        entry_error_builder::EntryErrorBuilder, project_error_builder::ProjectErrorBuilder,
    },
    types::entity::EntityType,
};

pub struct ErrorBuilder {
    message: String,
    error: Option<String>,
}

impl Default for ErrorBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl ErrorBuilder {
    pub fn new() -> Self {
        ErrorBuilder {
            message: String::new(),
            error: None,
        }
    }

    pub fn msg(&mut self, message: &str) -> &mut Self {
        self.message = message.to_owned();
        self
    }

    pub fn from_err<E: ToString>(&mut self, error: E) -> &mut Self {
        self.error = Some(error.to_string());
        self
    }

    pub fn project(&self) -> ProjectErrorBuilder {
        ProjectErrorBuilder::new()
    }

    pub fn entity(&self, entity_type: EntityType) -> EntityErrorBuilder {
        EntityErrorBuilder::new(&self.message, self.error.clone(), entity_type)
    }

    pub fn entry(&self, entity_type: EntityType) -> EntryErrorBuilder {
        EntryErrorBuilder::new(&self.message, self.error.clone(), entity_type, &"")
    }

    pub fn db(&self) -> DatabaseErrorBuilder {
        DatabaseErrorBuilder::new(&self.message, self.error.clone())
    }
}

use crate::model::errors::error::Error;

pub struct ProjectErrorBuilder {}

impl Default for ProjectErrorBuilder {
    fn default() -> Self {
        Self::new()
    }
}

impl ProjectErrorBuilder {
    pub fn new() -> Self {
        ProjectErrorBuilder {}
    }

    pub fn not_loaded(&self) -> Error {
        Error::ProjectNotLoaded
    }
}

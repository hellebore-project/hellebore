use crate::model::errors::error::Error;

pub struct ProjectErrorBuilder {
    message: String,
    error: Option<String>,
}

impl ProjectErrorBuilder {
    pub fn new(message: &str, error: Option<String>) -> Self {
        ProjectErrorBuilder {
            message: message.to_owned(),
            error,
        }
    }

    pub fn not_loaded(&self) -> Error {
        Error::ProjectNotLoaded
    }
}

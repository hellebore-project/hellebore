use crate::model::errors::error::Error;

pub struct DatabaseErrorBuilder {
    message: String,
    error: Option<String>,
}

impl DatabaseErrorBuilder {
    pub fn new(message: &str, error: Option<String>) -> Self {
        DatabaseErrorBuilder {
            message: message.to_owned(),
            error,
        }
    }

    pub fn connection_failed(&self) -> Error {
        Error::DatabaseConnectionFailed {
            msg: self.message.clone(),
            error: self.error.clone().unwrap_or(String::new()),
        }
    }

    pub fn migration_failed(&self) -> Error {
        Error::DatabaseMigrationFailed {
            msg: self.message.clone(),
            error: self.error.clone().unwrap_or(String::new()),
        }
    }

    pub fn transaction_failed(&self) -> Error {
        Error::DatabaseTransactionFailed {
            msg: self.message.clone(),
            error: self.error.clone().unwrap_or(String::new()),
        }
    }

    pub fn query_failed(&self) -> Error {
        Error::DatabaseQueryFailed {
            msg: self.message.clone(),
            error: self.error.clone().unwrap_or(String::new()),
        }
    }
}

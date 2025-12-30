use sea_orm::DbErr;
use serde::{Deserialize, Serialize};

use crate::{model::errors::text_error::TextError, types::entity::EntityType};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum ApiError {
    ProjectNotLoaded,
    BadEntryText {
        error: TextError,
    },

    // GENERAL ERRORS
    NotCreated {
        msg: String,
        entity_type: EntityType,
        error: Option<String>,
    },
    NotUpdated {
        msg: String,
        entity_type: EntityType,
        error: Option<String>,
    },
    NotFound {
        msg: String,
        entity_type: EntityType,
        error: Option<String>,
    },
    NotDeleted {
        msg: String,
        entity_type: EntityType,
        error: Option<String>,
    },
    FieldNotUpdated {
        msg: String,
        entity_type: EntityType,
        key: String,
        error: Option<String>,
    },
    FieldNotUnique {
        msg: String,
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: String,
        error: Option<String>,
    },
    FieldInvalid {
        msg: String,
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: String,
        error: Option<String>,
    },

    // MISCELLANEOUS ERRORS
    InternalError {
        msg: String,
        error: Option<String>,
    },
}

impl ApiError {
    pub fn bad_entry_text(error: TextError) -> ApiError {
        ApiError::BadEntryText { error }
    }

    pub fn not_created(msg: &str, entity_type: EntityType) -> ApiError {
        ApiError::NotCreated {
            msg: msg.to_owned(),
            entity_type,
            error: None::<String>,
        }
    }

    pub fn not_updated(msg: &str, entity_type: EntityType) -> ApiError {
        ApiError::NotUpdated {
            msg: msg.to_owned(),
            entity_type,
            error: None::<String>,
        }
    }

    pub fn not_found(msg: &str, entity_type: EntityType) -> ApiError {
        ApiError::NotFound {
            msg: msg.to_owned(),
            entity_type,
            error: None::<String>,
        }
    }

    pub fn not_deleted(msg: &str, entity_type: EntityType) -> ApiError {
        ApiError::NotDeleted {
            msg: msg.to_owned(),
            entity_type,
            error: None::<String>,
        }
    }

    pub fn field_not_updated(msg: &str, entity_type: EntityType, key: String) -> ApiError {
        ApiError::FieldNotUpdated {
            msg: msg.to_owned(),
            entity_type,
            key,
            error: None::<String>,
        }
    }

    pub fn field_not_unique<V: ToString>(
        msg: &str,
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: V,
    ) -> ApiError {
        ApiError::FieldNotUnique {
            msg: msg.to_owned(),
            entity_type,
            id,
            key,
            value: value.to_string(),
            error: None::<String>,
        }
    }

    pub fn field_invalid<V: ToString>(
        msg: &str,
        entity_type: EntityType,
        id: Option<i32>,
        key: &str,
        value: V,
    ) -> ApiError {
        ApiError::FieldInvalid {
            msg: msg.to_owned(),
            entity_type,
            id,
            key: key.to_string(),
            value: value.to_string(),
            error: None::<String>,
        }
    }

    pub fn internal(msg: &str) -> ApiError {
        ApiError::InternalError {
            msg: msg.to_owned(),
            error: None::<String>,
        }
    }

    pub fn db(msg: &str, error: DbErr) -> ApiError {
        ApiError::internal(msg).from_error(error)
    }

    pub fn from_error<E: ToString>(self, error: E) -> Self {
        match self {
            ApiError::NotCreated {
                msg, entity_type, ..
            } => ApiError::NotCreated {
                msg,
                entity_type,
                error: Some(error.to_string()),
            },
            ApiError::NotUpdated {
                msg, entity_type, ..
            } => ApiError::NotUpdated {
                msg,
                entity_type,
                error: Some(error.to_string()),
            },
            ApiError::NotFound {
                msg, entity_type, ..
            } => ApiError::NotFound {
                msg,
                entity_type,
                error: Some(error.to_string()),
            },
            ApiError::NotDeleted {
                msg, entity_type, ..
            } => ApiError::NotDeleted {
                msg,
                entity_type,
                error: Some(error.to_string()),
            },
            ApiError::FieldNotUpdated {
                msg,
                entity_type,
                key,
                ..
            } => ApiError::FieldNotUpdated {
                msg,
                entity_type,
                key,
                error: Some(error.to_string()),
            },
            ApiError::FieldNotUnique {
                msg,
                entity_type,
                id,
                key,
                value,
                ..
            } => ApiError::FieldNotUnique {
                msg,
                entity_type,
                id,
                key,
                value,
                error: Some(error.to_string()),
            },
            ApiError::FieldInvalid {
                msg,
                entity_type,
                id,
                key,
                value,
                ..
            } => ApiError::FieldInvalid {
                msg,
                entity_type,
                id,
                key,
                value,
                error: Some(error.to_string()),
            },
            ApiError::InternalError { msg, .. } => ApiError::InternalError {
                msg,
                error: Some(error.to_string()),
            },
            _ => ApiError::InternalError {
                msg: self.to_string(),
                error: Some(error.to_string()),
            },
        }
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiError::ProjectNotLoaded => write!(f, "Project not loaded"),
            ApiError::BadEntryText { error } => {
                write!(f, "BAD ENTRY TEXT. {}", error)
            }
            ApiError::NotCreated {
                msg,
                entity_type,
                error,
            } => {
                write!(
                    f,
                    "NOT INSERTED. {} Entity: {:?}. Error: {:?}",
                    msg, entity_type, error
                )
            }
            ApiError::NotUpdated {
                msg,
                entity_type,
                error,
            } => {
                write!(
                    f,
                    "NOT UPDATED. {} Entity: {:?}. Error: {:?}",
                    msg, entity_type, error,
                )
            }
            ApiError::NotFound {
                msg,
                entity_type,
                error,
            } => {
                write!(
                    f,
                    "NOT FOUND. {} Entity: {:?}. Error: {:?}",
                    msg, entity_type, error,
                )
            }
            ApiError::NotDeleted {
                msg,
                entity_type,
                error,
            } => {
                write!(
                    f,
                    "NOT DELETED. {} Entity: {:?}. Error: {:?}",
                    msg, entity_type, error
                )
            }
            ApiError::FieldNotUpdated {
                msg,
                entity_type,
                key,
                error,
            } => write!(
                f,
                "FIELD NOT UPDATED. {} Entity: {:?}; key: {}. Error: {:?}",
                msg, entity_type, key, error
            ),
            ApiError::FieldNotUnique {
                msg,
                entity_type,
                id,
                key,
                value,
                error,
            } => write!(
                f,
                "FIELD NOT UNIQUE. {} Entity: {:?}; id: {:?}; key: {}; value: {}. Error: {:?}",
                msg, entity_type, id, key, value, error
            ),
            ApiError::FieldInvalid {
                msg,
                entity_type,
                id,
                key,
                value,
                error,
            } => write!(
                f,
                "INVALID FIELD. {} Entity: {:?}; id: {:?}; key: {}; value: {}. Error: {:?}",
                msg, entity_type, id, key, value, error
            ),
            ApiError::InternalError { msg, error } => {
                write!(f, "INTERNAL ERROR. {} Error: {:?}", msg, error)
            }
        }
    }
}

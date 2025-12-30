use sea_orm::DbErr;
use serde::{Deserialize, Serialize};

use crate::{types::entity::EntityType, utils::string_or_none};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum ApiError {
    ProjectNotLoaded,
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
    InternalError {
        msg: String,
        error: Option<String>,
    },
}

impl ApiError {
    pub fn not_created<E: ToString>(
        msg: &str,
        entity_type: EntityType,
        error: Option<E>,
    ) -> ApiError {
        ApiError::NotCreated {
            msg: msg.to_owned(),
            entity_type,
            error: string_or_none(error),
        }
    }

    pub fn not_updated<E: ToString>(
        msg: &str,
        entity_type: EntityType,
        error: Option<E>,
    ) -> ApiError {
        ApiError::NotUpdated {
            msg: msg.to_owned(),
            entity_type,
            error: string_or_none(error),
        }
    }

    pub fn not_found<E: ToString>(
        msg: &str,
        entity_type: EntityType,
        error: Option<E>,
    ) -> ApiError {
        ApiError::NotFound {
            msg: msg.to_owned(),
            entity_type,
            error: string_or_none(error),
        }
    }

    pub fn not_deleted<E: ToString>(
        msg: &str,
        entity_type: EntityType,
        error: Option<E>,
    ) -> ApiError {
        ApiError::NotDeleted {
            msg: msg.to_owned(),
            entity_type,
            error: string_or_none(error),
        }
    }

    pub fn field_not_updated<E: ToString>(
        msg: &str,
        entity_type: EntityType,
        key: String,
        error: Option<E>,
    ) -> ApiError {
        ApiError::FieldNotUpdated {
            msg: msg.to_owned(),
            entity_type,
            key,
            error: string_or_none(error),
        }
    }

    pub fn field_not_unique<V: ToString, E: ToString>(
        msg: &str,
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: V,
        error: Option<E>,
    ) -> ApiError {
        ApiError::FieldNotUnique {
            msg: msg.to_owned(),
            entity_type,
            id,
            key,
            value: value.to_string(),
            error: string_or_none(error),
        }
    }

    pub fn field_invalid<V: ToString, E: ToString>(
        msg: &str,
        entity_type: EntityType,
        id: Option<i32>,
        key: &str,
        value: V,
        error: Option<E>,
    ) -> ApiError {
        ApiError::FieldInvalid {
            msg: msg.to_owned(),
            entity_type,
            id,
            key: key.to_string(),
            value: value.to_string(),
            error: string_or_none(error),
        }
    }

    pub fn internal<E: ToString>(msg: &str, error: Option<E>) -> ApiError {
        ApiError::InternalError {
            msg: msg.to_owned(),
            error: string_or_none(error),
        }
    }

    pub fn db(msg: &str, error: DbErr) -> ApiError {
        ApiError::internal(msg, Some(error))
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiError::ProjectNotLoaded => write!(f, "Project not loaded"),
            ApiError::NotCreated {
                msg,
                entity_type,
                error,
            } => {
                write!(
                    f,
                    "Not inserted: {}. Entity: {:?}. Error: {:?}",
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
                    "Not updated: {}. Entity: {:?}. Error: {:?}",
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
                    "Not found: {}. Entity: {:?}. Error: {:?}",
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
                    "Not deleted: {}. Entity: {:?}. Error: {:?}",
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
                "Field not updated: {}. Entity: {:?}; key: {}. Error: {:?}",
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
                "Field not unique: {}. Entity: {:?}; id: {:?}; key: {}; value: {}. Error: {:?}",
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
                "Field invalid: {}. Entity: {:?}; id: {:?}; key: {}; value: {}. Error: {:?}",
                msg, entity_type, id, key, value, error
            ),
            ApiError::InternalError { msg, error } => {
                write!(f, "Internal error: {}. Error: {:?}", msg, error)
            }
        }
    }
}

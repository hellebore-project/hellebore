use serde::{Deserialize, Serialize};

use crate::types::entity::EntityType;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ApiError {
    DatabaseConnectionFailed {
        msg: String,
        connection_string: String,
    },
    DatabaseMigrationFailed {
        msg: String,
        connection_string: String,
    },
    DatabaseTransactionFailed {
        msg: String,
    },
    NotInserted {
        msg: String,
        entity_type: EntityType,
    },
    NotUpdated {
        msg: String,
        entity_type: EntityType,
    },
    NotFound {
        msg: String,
        entity_type: EntityType,
    },
    NotDeleted {
        msg: String,
        entity_type: EntityType,
    },
    QueryFailed {
        msg: String,
        entity_type: EntityType,
    },
    FieldNotUpdated {
        msg: String,
        entity_type: EntityType,
        key: String,
    },
    FieldNotUnique {
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: String,
    },
    FieldInvalid {
        msg: String,
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: String,
    },
    ProjectNotLoaded,
}

impl ApiError {
    pub fn db_connection_failed<M: ToString>(msg: M, connection_string: String) -> ApiError {
        return ApiError::DatabaseConnectionFailed {
            msg: msg.to_string(),
            connection_string,
        };
    }

    pub fn db_migration_failed<M: ToString>(msg: M, connection_string: String) -> ApiError {
        return ApiError::DatabaseMigrationFailed {
            msg: msg.to_string(),
            connection_string,
        };
    }

    pub fn db_transaction_failed<M: ToString>(msg: M) -> ApiError {
        return ApiError::DatabaseTransactionFailed {
            msg: msg.to_string(),
        };
    }

    pub fn not_inserted<M: ToString>(msg: M, entity_type: EntityType) -> ApiError {
        return ApiError::NotInserted {
            msg: msg.to_string(),
            entity_type,
        };
    }

    pub fn not_updated<M: ToString>(msg: M, entity_type: EntityType) -> ApiError {
        return ApiError::NotUpdated {
            msg: msg.to_string(),
            entity_type,
        };
    }

    pub fn not_found<M: ToString>(msg: M, entity_type: EntityType) -> ApiError {
        return ApiError::NotFound {
            msg: msg.to_string(),
            entity_type,
        };
    }

    pub fn not_deleted<M: ToString>(msg: M, entity_type: EntityType) -> ApiError {
        return ApiError::NotDeleted {
            msg: msg.to_string(),
            entity_type,
        };
    }

    pub fn query_failed<M: ToString>(msg: M, entity_type: EntityType) -> ApiError {
        return ApiError::QueryFailed {
            msg: msg.to_string(),
            entity_type,
        };
    }

    pub fn field_not_updated<M: ToString>(
        msg: M,
        entity_type: EntityType,
        key: String,
    ) -> ApiError {
        return ApiError::FieldNotUpdated {
            msg: msg.to_string(),
            entity_type,
            key,
        };
    }

    pub fn field_not_unique<V: ToString>(
        entity_type: EntityType,
        id: Option<i32>,
        key: String,
        value: V,
    ) -> ApiError {
        return ApiError::FieldNotUnique {
            entity_type,
            id,
            key,
            value: value.to_string(),
        };
    }

    pub fn field_invalid<M: ToString, V: ToString>(
        msg: M,
        entity_type: EntityType,
        id: Option<i32>,
        key: &str,
        value: V,
    ) -> ApiError {
        return ApiError::FieldInvalid {
            msg: msg.to_string(),
            entity_type,
            id,
            key: key.to_string(),
            value: value.to_string(),
        };
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ApiError::DatabaseConnectionFailed {
                msg,
                connection_string,
            } => write!(
                f,
                "Database connection failed: {} (connection string: {})",
                msg, connection_string
            ),
            ApiError::DatabaseMigrationFailed {
                msg,
                connection_string,
            } => write!(
                f,
                "Database migration failed: {} (connection string: {})",
                msg, connection_string
            ),
            ApiError::DatabaseTransactionFailed { msg } => {
                write!(f, "Database transaction failed: {}", msg)
            }
            ApiError::NotInserted { msg, entity_type } => {
                write!(f, "Not inserted: {} (entity: {:?})", msg, entity_type)
            }
            ApiError::NotUpdated { msg, entity_type } => {
                write!(f, "Not updated: {} (entity: {:?})", msg, entity_type)
            }
            ApiError::NotFound { msg, entity_type } => {
                write!(f, "Not found: {} (entity: {:?})", msg, entity_type)
            }
            ApiError::NotDeleted { msg, entity_type } => {
                write!(f, "Not deleted: {} (entity: {:?})", msg, entity_type)
            }
            ApiError::QueryFailed { msg, entity_type } => {
                write!(f, "Query failed: {} (entity: {:?})", msg, entity_type)
            }
            ApiError::FieldNotUpdated {
                msg,
                entity_type,
                key,
            } => write!(
                f,
                "Field not updated: {} (entity: {:?}, key: {})",
                msg, entity_type, key
            ),
            ApiError::FieldNotUnique {
                entity_type,
                id,
                key,
                value,
            } => write!(
                f,
                "Field not unique: (entity: {:?}, id: {:?}, key: {}, value: {})",
                entity_type, id, key, value
            ),
            ApiError::FieldInvalid {
                msg,
                entity_type,
                id,
                key,
                value,
            } => write!(
                f,
                "Field invalid: {} (entity: {:?}, id: {:?}, key: {}, value: {})",
                msg, entity_type, id, key, value
            ),
            ApiError::ProjectNotLoaded => write!(f, "Project not loaded"),
        }
    }
}

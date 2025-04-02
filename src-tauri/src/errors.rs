use serde::{Deserialize, Serialize};

use crate::types::EntityType;

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
        key: &str,
        value: V,
    ) -> ApiError {
        return ApiError::FieldNotUnique {
            entity_type,
            id,
            key: key.to_string(),
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

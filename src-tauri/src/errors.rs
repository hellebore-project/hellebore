use serde::{Deserialize, Serialize};

use crate::types::EntityType;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ApiError {
    NotInserted {
        msg: String,
        entity: EntityType,
    },
    NotUpdated {
        msg: String,
        entity: EntityType,
    },
    FieldNotUpdated {
        msg: String,
        entity: EntityType,
        field: String,
    },
    NotFound {
        msg: String,
        entity: EntityType,
    },
    NotDeleted {
        msg: String,
        entity: EntityType,
    },
    QueryFailed {
        msg: String,
        entity: EntityType,
    },
}

impl ApiError {
    pub fn not_inserted<M: ToString>(msg: M, entity: EntityType) -> ApiError {
        return ApiError::NotInserted {
            msg: msg.to_string(),
            entity,
        };
    }

    pub fn not_updated<M: ToString>(msg: M, entity: EntityType) -> ApiError {
        return ApiError::NotUpdated {
            msg: msg.to_string(),
            entity,
        };
    }

    pub fn field_not_updated<M: ToString>(msg: M, entity: EntityType, field: String) -> ApiError {
        return ApiError::FieldNotUpdated {
            msg: msg.to_string(),
            entity,
            field,
        };
    }

    pub fn not_found<M: ToString>(msg: M, entity: EntityType) -> ApiError {
        return ApiError::NotFound {
            msg: msg.to_string(),
            entity,
        };
    }

    pub fn not_deleted<M: ToString>(msg: M, entity: EntityType) -> ApiError {
        return ApiError::NotDeleted {
            msg: msg.to_string(),
            entity,
        };
    }

    pub fn query_failed<M: ToString>(msg: M, entity: EntityType) -> ApiError {
        return ApiError::QueryFailed {
            msg: msg.to_string(),
            entity,
        };
    }
}

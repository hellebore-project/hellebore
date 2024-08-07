use serde::{Serialize, Deserialize};

use crate::types::EntityType;

#[derive(Serialize, Deserialize)]
pub enum ApiError {
    NotInserted { msg: String, table: EntityType },
    NotUpdated { msg: String, table: EntityType },
    NotFound { msg: String, table: EntityType },
    NotDeleted { msg: String, table: EntityType },
    QueryFailed { msg: String, table: EntityType },
}

impl ApiError {
    pub fn not_inserted<M: ToString>(msg: M, table: EntityType) -> ApiError {
        return ApiError::NotInserted { msg: msg.to_string(), table };
    }

    pub fn not_updated<M: ToString>(msg: M, table: EntityType) -> ApiError {
        return ApiError::NotUpdated { msg: msg.to_string(), table };
    }

    pub fn not_found<M: ToString>(msg: M, table: EntityType) -> ApiError {
        return ApiError::NotFound { msg: msg.to_string(), table };
    }

    pub fn not_deleted<M: ToString>(msg: M, table: EntityType) -> ApiError {
        return ApiError::NotDeleted { msg: msg.to_string(), table };
    }

    pub fn query_failed<M: ToString>(msg: M, table: EntityType) -> ApiError {
        return ApiError::QueryFailed { msg: msg.to_string(), table };
    }
}
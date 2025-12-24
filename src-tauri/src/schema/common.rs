use serde::{Deserialize, Serialize};

use crate::errors::ApiError;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateResponseSchema {
    pub updated: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticResponseSchema<E> {
    pub data: E,
    pub errors: Vec<ApiError>,
}

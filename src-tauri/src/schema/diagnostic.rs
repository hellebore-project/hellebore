use serde::{Deserialize, Serialize};

use crate::errors::ApiError;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all(serialize = "camelCase", deserialize = "snake_case"))]
pub struct ResponseDiagnosticsSchema<E> {
    pub data: E,
    pub errors: Vec<ApiError>,
}

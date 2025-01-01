use serde::{Deserialize, Serialize};

use crate::errors::ApiError;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ResponseDiagnosticsSchema<E> {
    pub data: E,
    pub errors: Vec<ApiError>,
}

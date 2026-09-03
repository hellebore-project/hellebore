use serde::{Deserialize, Serialize};

use crate::model::Error;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticResponseSchema<D> {
    pub data: D,
    pub errors: Vec<Error>,
}

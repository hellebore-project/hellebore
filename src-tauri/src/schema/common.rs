use serde::{Deserialize, Serialize};

use crate::model::errors::error::Error;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateResponseSchema {
    pub updated: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertResponseSchema {
    pub created: bool,
    pub updated: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticResponseSchema<D> {
    pub data: D,
    pub errors: Vec<Error>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedResponseSchema<D> {
    pub data: Vec<D>,
    pub page_index: u64,
    pub items_per_page_count: u64,
    pub total_item_count: u64,
    pub total_page_count: u64,
}

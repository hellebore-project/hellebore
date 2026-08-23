use serde::{Deserialize, Serialize};

use crate::model::Error;

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
pub struct PaginationRequestSchema {
    /// 0-based index of the first item in the current page
    pub offset: Option<u64>,
    /// maximum number of items per page
    pub limit: Option<u64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationResponseSchema<D> {
    /// array of items in the current page
    pub data: Vec<D>,
    /// 0-based index of the current page
    pub page_index: u64,
    /// number of pages
    pub page_count: u64,
    /// number of items in the current page
    pub item_count: u64,
    /// total number of items across all pages
    pub total: u64,
    /// 0-based index of the first item in the current page
    pub offset: u64,
    /// maximum number of items per page
    pub limit: u64,
}

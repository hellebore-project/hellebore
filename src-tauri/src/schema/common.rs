use serde::{Deserialize, Serialize};

use crate::model::Error;
use crate::utils::serde::{default_true, default_zero};

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
pub struct PaginationRequestSchema<D: Default> {
    pub data: D,
    /// 0-based index of the current page
    #[serde(default = "default_zero")]
    pub page_index: u64,
    /// 0-based index of the first item in the current page
    pub offset: Option<u64>,
    /// maximum number of items per page
    pub limit: Option<u64>,
    /// return the item total in the response
    #[serde(default = "default_true")]
    pub include_total: bool,
}

impl<D: Default> Default for PaginationRequestSchema<D> {
    fn default() -> Self {
        PaginationRequestSchema {
            data: D::default(),
            page_index: 0,
            offset: None,
            limit: None,
            include_total: false,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationResponseSchema<D> {
    /// array of items in the current page
    pub items: Vec<D>,
    /// 0-based index of the current page
    pub page_index: u64,
    /// number of pages
    pub page_count: Option<u64>,
    /// number of items in the current page
    pub item_count: u64,
    /// total number of items across all pages
    pub total: Option<u64>,
    /// 0-based index of the first item in the current page
    pub offset: Option<u64>,
    /// maximum number of items per page
    pub limit: Option<u64>,
}

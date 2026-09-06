use serde::{Deserialize, Serialize};

use crate::{types::SortOrder, utils::serde::default_true};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[derive(Default)]
pub struct PaginationSchema {
    /// 0-based index of the current page
    #[serde(default)]
    pub page_index: u64,
    /// 0-based index of the first item in the current page
    pub offset: Option<u64>,
    /// maximum number of items per page
    pub limit: Option<u64>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[derive(Default)]
pub struct SortItemSchema {
    pub field: String,
    pub order: SortOrder,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryRequestSchema<D: Default> {
    pub data: D,
    #[serde(default)]
    pub pagination: PaginationSchema,
    #[serde(default)]
    pub sortation: Vec<SortItemSchema>,
    /// return the total number of items in the response
    #[serde(default = "default_true")]
    pub include_total: bool,
}

impl<D: Default> Default for QueryRequestSchema<D> {
    fn default() -> Self {
        QueryRequestSchema {
            data: D::default(),
            pagination: PaginationSchema {
                page_index: 0,
                offset: None,
                limit: None,
            },
            sortation: Vec::new(),
            include_total: false,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryResponseSchema<D> {
    /// array of items in the current page
    pub items: Vec<D>,
    /// 0-based index of the current page
    pub page_index: u64,
    /// number of pages
    pub page_count: Option<u64>,
    /// total number of items across all pages
    pub total: Option<u64>,
    /// 0-based index of the first item in the current page
    pub offset: Option<u64>,
    /// maximum number of items per page
    pub limit: Option<u64>,
}

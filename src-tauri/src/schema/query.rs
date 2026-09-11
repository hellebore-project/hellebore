use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    types::SortOrder,
    utils::{CodedEnum, serde::default_true},
};

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
pub struct SortItemSchema<P: CodedEnum> {
    pub field: P,
    pub order: SortOrder,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum PredicateUnionSchema<T> {
    Equal { value: T },
    NotEqual { value: T },
    GreaterThan { value: T },
    GreaterThanOrEqual { value: T },
    LessThan { value: T },
    LessThanOrEqual { value: T },
    In { values: Vec<T> },
    NotIn { values: Vec<T> },
    Like { values: T },
    NotLike { values: T },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterItemSchema<P: CodedEnum, T> {
    pub field: P,
    pub predicate: PredicateUnionSchema<T>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum FilterItemUnionSchema<P: CodedEnum> {
    Integer(FilterItemSchema<P, i32>),
    String(FilterItemSchema<P, String>),
    Uuid(FilterItemSchema<P, Uuid>),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryRequestSchema<P: CodedEnum, D: Default> {
    pub data: D,
    #[serde(default)]
    pub pagination: PaginationSchema,
    #[serde(default)]
    pub sortation: Vec<SortItemSchema<P>>,
    #[serde(default)]
    pub filters: Vec<FilterItemUnionSchema<P>>,
    /// return the total number of items in the response
    #[serde(default = "default_true")]
    pub include_total: bool,
}

impl<P: CodedEnum, D: Default> Default for QueryRequestSchema<P, D> {
    fn default() -> Self {
        QueryRequestSchema {
            data: D::default(),
            pagination: PaginationSchema {
                page_index: 0,
                offset: None,
                limit: None,
            },
            sortation: Vec::new(),
            filters: Vec::new(),
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

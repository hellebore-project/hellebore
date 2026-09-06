use sea_orm::ConnectionTrait;

use crate::{model::Error, types::SortOrder};

pub struct PaginationModel {
    pub offset: Option<u64>,
    pub limit: Option<u64>,
}

pub struct SortItem {
    pub field: String,
    pub order: SortOrder,
}

impl SortItem {
    pub fn new(field: String, order: SortOrder) -> Self {
        Self { field, order }
    }
}

pub struct Query<T> {
    pub pagination: PaginationModel,
    pub sortation: Vec<SortItem>,
    pub options: T,
}

pub struct QueryResult<T> {
    pub items: Vec<T>,
    pub page_index: u64,
    pub page_count: Option<u64>,
    pub total: Option<u64>,
    pub offset: Option<u64>,
    pub limit: Option<u64>,
}

pub trait Querier {
    /// Query options type
    type O;
    /// Result type
    type R;
    #[allow(async_fn_in_trait)]
    async fn query<C: ConnectionTrait>(
        con: &C,
        args: &Query<Self::O>,
    ) -> Result<Vec<Self::R>, Error>;
    #[allow(async_fn_in_trait)]
    async fn count<C: ConnectionTrait>(con: &C, args: &Query<Self::O>) -> Result<u64, Error>;
}

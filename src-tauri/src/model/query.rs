use sea_orm::ConnectionTrait;
use uuid::Uuid;

use crate::{model::Error, types::SortOrder};

pub struct PaginationModel {
    pub offset: Option<u64>,
    pub limit: Option<u64>,
}

pub struct SortItem<P> {
    pub field: P,
    pub order: SortOrder,
}

impl<P> SortItem<P> {
    pub fn new(field: P, order: SortOrder) -> Self {
        Self { field, order }
    }
}

#[derive(Clone, Debug)]
pub enum Predicate<T> {
    Equal { value: T },
    NotEqual { value: T },
    GreaterThan { value: T },
    GreaterThanOrEqual { value: T },
    LessThan { value: T },
    LessThanOrEqual { value: T },
    In { values: Vec<T> },
    NotIn { values: Vec<T> },
    Like { value: T },
    NotLike { value: T },
}

pub struct FilterItem<P, T> {
    pub field: P,
    pub predicate: Predicate<T>,
}

pub enum FilterItemType<P> {
    Integer(FilterItem<P, i32>),
    String(FilterItem<P, String>),
    Uuid(FilterItem<P, Uuid>),
}

pub struct Query<P, T> {
    pub pagination: PaginationModel,
    pub sortation: Vec<SortItem<P>>,
    pub filters: Vec<FilterItemType<P>>,
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
    /// Queriable entity properties
    type P;
    /// Query options type
    type O;
    /// Result type
    type R;
    #[allow(async_fn_in_trait)]
    async fn query<C: ConnectionTrait>(
        con: &C,
        args: &Query<Self::P, Self::O>,
    ) -> Result<Vec<Self::R>, Error>;
    #[allow(async_fn_in_trait)]
    async fn count<C: ConnectionTrait>(
        con: &C,
        args: &Query<Self::P, Self::O>,
    ) -> Result<u64, Error>;
}

use sea_orm::ConnectionTrait;

use crate::model::Error;

pub struct QueryArgs<T> {
    pub options: T,
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
        args: &QueryArgs<Self::O>,
    ) -> Result<Vec<Self::R>, Error>;
    #[allow(async_fn_in_trait)]
    async fn count<C: ConnectionTrait>(con: &C, args: &QueryArgs<Self::O>) -> Result<u64, Error>;
}

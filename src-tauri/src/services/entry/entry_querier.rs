use sea_orm::ConnectionTrait;

use crate::database::entry_manager;
use crate::model::{
    Error, ErrorBuilder, Querier, Query,
    entry::{EntryInfo, EntryQueryOptions},
};
use crate::types::queryable_properties::QueryableEntryProperties;

pub struct EntryQuerier {}

impl Querier for EntryQuerier {
    type P = QueryableEntryProperties;
    type O = EntryQueryOptions;
    type R = EntryInfo;

    async fn query<C>(
        con: &C,
        query: &Query<QueryableEntryProperties, EntryQueryOptions>,
    ) -> Result<Vec<EntryInfo>, Error>
    where
        C: ConnectionTrait,
    {
        entry_manager::get_many(con, query).await.map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to query the entry table while searching for entries.")
                .from_err(e)
                .db()
                .query_failed()
        })
    }

    async fn count<C>(
        con: &C,
        query: &Query<QueryableEntryProperties, EntryQueryOptions>,
    ) -> Result<u64, Error>
    where
        C: ConnectionTrait,
    {
        entry_manager::count(con, query).await.map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to compute the count of all entries.")
                .from_err(e)
                .db()
                .query_failed()
        })
    }
}

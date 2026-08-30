use sea_orm::ConnectionTrait;

use crate::database::entry_manager;
use crate::model::{Error, ErrorBuilder, Querier, QueryArgs, entry::EntryQueryData};

pub struct EntryQuerier {}

impl Querier for EntryQuerier {
    type O = EntryQueryData;
    type R = entry_manager::EntryInfo;

    async fn query<C>(
        con: &C,
        query: &QueryArgs<EntryQueryData>,
    ) -> Result<Vec<entry_manager::EntryInfo>, Error>
    where
        C: ConnectionTrait,
    {
        entry_manager::search(
            con,
            query.options.like_title.to_owned(),
            query.offset,
            query.limit,
        )
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to query the entry table while searching for entries.")
                .from_err(e)
                .db()
                .query_failed()
        })
    }

    async fn count<C>(con: &C, query: &QueryArgs<EntryQueryData>) -> Result<u64, Error>
    where
        C: ConnectionTrait,
    {
        entry_manager::count(
            con,
            query.options.like_title.to_owned(),
            query.offset,
            query.limit,
        )
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to compute the count of all entries.")
                .from_err(e)
                .db()
                .query_failed()
        })
    }
}

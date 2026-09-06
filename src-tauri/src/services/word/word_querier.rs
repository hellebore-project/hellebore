use sea_orm::ConnectionTrait;

use crate::database::word_manager;
use crate::model::{
    Error, ErrorBuilder, Querier, Query,
    word::{Word, WordQueryData},
};

pub struct WordQuerier {}

impl Querier for WordQuerier {
    type O = WordQueryData;
    type R = Word;

    async fn query<C>(con: &C, query: &Query<WordQueryData>) -> Result<Vec<Word>, Error>
    where
        C: ConnectionTrait,
    {
        word_manager::get_many(con, query).await.map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to query the word table while searching for words.")
                .from_err(e)
                .db()
                .query_failed()
        })
    }

    async fn count<C>(con: &C, query: &Query<WordQueryData>) -> Result<u64, Error>
    where
        C: ConnectionTrait,
    {
        word_manager::count(con, query).await.map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to compute the count of all words.")
                .from_err(e)
                .db()
                .query_failed()
        })
    }
}

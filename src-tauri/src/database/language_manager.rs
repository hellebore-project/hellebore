use sea_orm::*;
use uuid::Uuid;

use ::entity::{language, language::Entity as Language};

pub async fn insert<C>(con: &C, entry_id: Uuid) -> Result<language::Model, DbErr>
where
    C: ConnectionTrait,
{
    let language = language::ActiveModel {
        id: Set(Uuid::new_v4()),
        entry_id: Set(entry_id),
    };
    language.insert(con).await
}

pub async fn get<C>(con: &C, entry_id: Uuid) -> Result<Option<language::Model>, DbErr>
where
    C: ConnectionTrait,
{
    Language::find()
        .filter(language::Column::EntryId.eq(entry_id))
        .one(con)
        .await
}

pub async fn get_all<C>(con: &C) -> Result<Vec<language::Model>, DbErr>
where
    C: ConnectionTrait,
{
    Language::find()
        .order_by_asc(language::Column::Id)
        .all(con)
        .await
}

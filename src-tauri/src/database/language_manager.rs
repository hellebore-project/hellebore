use sea_orm::*;

use ::entity::{language, language::Entity as Language};

pub async fn insert<C>(con: &C, entry_id: i32) -> Result<language::Model, DbErr>
where
    C: ConnectionTrait,
{
    let language = language::ActiveModel {
        id: NotSet,
        entry_id: Set(entry_id),
    };
    language.insert(con).await
}

pub async fn get<C>(con: &C, entry_id: i32) -> Result<Option<language::Model>, DbErr>
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

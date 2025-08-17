use sea_orm::*;

use ::entity::{language, language::Entity as Language};

pub async fn insert(db: &DbConn, entry_: i32) -> Result<language::Model, DbErr> {
    let entity = language::ActiveModel {
        id: NotSet,
        entry_id: Set(entry_),
    };
    entity.insert(db).await
}

pub async fn get(db: &DbConn, entry_id: i32) -> Result<Option<language::Model>, DbErr> {
    Language::find()
        .filter(language::Column::EntryId.eq(entry_id))
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<language::Model>, DbErr> {
    Language::find()
        .order_by_asc(language::Column::Id)
        .all(db)
        .await
}

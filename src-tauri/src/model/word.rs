use ::entity::word::Entity as WordModel;
use sea_orm::*;
use serde_json::Value;
use uuid::Uuid;

#[derive(DerivePartialModel)]
#[sea_orm(entity = "WordModel")]
pub struct Word {
    pub id: Uuid,
    pub language_id: Uuid,
    pub word_type: i8,
    pub spelling: String,
    pub definition: String,
    pub translations: Value,
}

pub struct WordQueryOptions {}

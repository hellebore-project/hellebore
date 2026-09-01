use ::entity::word::Entity as WordModel;
use sea_orm::*;
use serde_json::Value;
use uuid::Uuid;

use crate::types::grammar_types::WordType;

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

pub struct WordQueryData {
    pub language_id: Option<Uuid>,
    pub word_types: Option<Vec<WordType>>,
    pub like_spelling: Option<String>,
}

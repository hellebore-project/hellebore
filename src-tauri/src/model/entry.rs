use ::entity::entry::Entity as EntryModel;
use sea_orm::*;
use uuid::Uuid;

#[derive(DerivePartialModel)]
#[sea_orm(entity = "EntryModel")]
pub struct EntryInfo {
    pub id: Uuid,
    pub folder_id: Option<Uuid>,
    pub entity_type: i8,
    pub title: String,
}

pub struct EntryQueryData {
    pub like_title: Option<String>,
}

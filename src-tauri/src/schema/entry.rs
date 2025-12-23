use serde::{Deserialize, Serialize};

use crate::{
    schema::{language::LanguageSchema, person::PersonSchema},
    types::entity::EntityType,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum EntryProperties {
    Language(LanguageSchema),
    Person(PersonSchema),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryCreateSchema {
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
    pub properties: EntryProperties,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryUpdateSchema {
    pub id: i32,
    pub folder_id: Option<i32>,
    pub title: Option<String>,
    pub properties: Option<EntryProperties>,
    pub text: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryInfoResponseSchema {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryPropertyResponseSchema {
    pub info: EntryInfoResponseSchema,
    pub properties: EntryProperties,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryArticleResponseSchema {
    pub info: EntryInfoResponseSchema,
    pub text: String,
}

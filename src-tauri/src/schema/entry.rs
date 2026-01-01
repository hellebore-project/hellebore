use serde::{Deserialize, Serialize};

use crate::{
    model::text::TextNode,
    schema::{
        common::UpdateResponseSchema,
        language::LanguageSchema,
        person::PersonSchema,
        word::{WordUpsertResponseSchema, WordUpsertSchema},
    },
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
    pub words: Option<Vec<WordUpsertSchema>>,
}

impl EntryUpdateSchema {
    pub fn has_update(&self) -> bool {
        self.folder_id.is_some()
            || self.title.is_some()
            || self.properties.is_some()
            || self.text.is_some()
            || self.words.is_some()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryTitleUpdateResponseSchema {
    pub updated: bool,
    pub is_unique: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntryUpdateResponseSchema {
    pub id: i32,
    pub folder_id: UpdateResponseSchema,
    pub title: EntryTitleUpdateResponseSchema,
    pub properties: UpdateResponseSchema,
    pub text: UpdateResponseSchema,
    pub words: Vec<WordUpsertResponseSchema>,
}

impl EntryUpdateResponseSchema {
    pub fn new(entry: &EntryUpdateSchema) -> Self {
        Self {
            id: entry.id,
            folder_id: UpdateResponseSchema {
                updated: entry.folder_id.is_some(),
            },
            title: EntryTitleUpdateResponseSchema {
                updated: entry.title.is_some(),
                is_unique: true,
            },
            properties: UpdateResponseSchema {
                updated: entry.properties.is_some(),
            },
            text: UpdateResponseSchema {
                updated: entry.text.is_some(),
            },
            words: Vec::new(),
        }
    }

    pub fn set_updated(&mut self, updated: bool) {
        self.folder_id.updated = updated;
        self.title.updated = updated;
        self.properties.updated = updated;
        self.text.updated = updated;
    }
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
    pub text: TextNode,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntrySearchSchema {
    pub keyword: String,
    pub before: Option<String>,
    pub after: Option<String>,
    pub limit: u64,
}

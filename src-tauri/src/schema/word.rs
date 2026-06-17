use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{schema::common::UpsertResponseSchema, types::grammar::WordType};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordUpsertSchema {
    pub id: Option<Uuid>,
    pub language_id: Option<Uuid>,
    pub word_type: Option<WordType>,
    pub spelling: Option<String>,
    pub definition: Option<String>,
    pub translations: Option<Vec<String>>,
}

impl WordUpsertSchema {
    pub fn to_response(&self) -> WordResponseSchema {
        WordResponseSchema {
            id: self.id.unwrap_or_default(),
            language_id: self.language_id.unwrap_or_default(),
            word_type: self.word_type.unwrap_or_default(),
            spelling: self.spelling.clone().unwrap_or_default(),
            definition: self.definition.clone().unwrap_or_default(),
            translations: self.translations.clone().unwrap_or_default(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordUpsertResponseSchema {
    pub id: Option<Uuid>,
    pub status: UpsertResponseSchema,
}

impl WordUpsertResponseSchema {
    pub fn new(word: &WordUpsertSchema) -> Self {
        WordUpsertResponseSchema {
            id: word.id,
            status: UpsertResponseSchema {
                created: word.id.is_none(),
                updated: word.id.is_some(),
            },
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordResponseSchema {
    pub id: Uuid,
    pub language_id: Uuid,
    pub word_type: WordType,
    pub spelling: String,
    pub definition: String,
    pub translations: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordQuerySchema {
    pub language_id: Uuid,
    pub page_index: u64,
    pub per_page: u64,
    pub word_types: Option<Vec<WordType>>,
    pub spelling: Option<String>,
    pub definition: Option<String>,
    pub translations: Option<String>,
}

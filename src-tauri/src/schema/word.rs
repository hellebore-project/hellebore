use serde::{Deserialize, Serialize};

use crate::{types::grammar::WordType, utils::value_or_default};

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordUpdateSchema {
    pub id: Option<i32>,
    pub language_id: Option<i32>,
    pub word_type: Option<WordType>,
    pub spelling: Option<String>,
    pub definition: Option<String>,
    pub translations: Option<Vec<String>>,
}

impl WordUpdateSchema {
    pub fn to_response(&self) -> WordResponseSchema {
        WordResponseSchema {
            id: value_or_default(self.id),
            language_id: value_or_default(self.language_id),
            word_type: value_or_default(self.word_type),
            spelling: value_or_default(self.spelling.clone()),
            definition: value_or_default(self.definition.clone()),
            translations: value_or_default(self.translations.clone()),
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WordResponseSchema {
    pub id: i32,
    pub language_id: i32,
    pub word_type: WordType,
    pub spelling: String,
    pub definition: String,
    pub translations: Vec<String>,
}

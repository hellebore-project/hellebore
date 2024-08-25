use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LanguageDataSchema {
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IdentifiedLanguageSchema {
    pub id: i32,
    pub data: LanguageDataSchema,
}

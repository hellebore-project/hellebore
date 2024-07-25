use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Language {
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IdentifiedLanguage {
    pub id: i32,
    pub data: Language,
}
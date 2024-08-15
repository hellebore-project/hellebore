use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum EntityType {
    Article,
    Language
}

impl EntityType {
    pub fn name(&self) -> String {
        match self {
            EntityType::Article => String::from("ARTICLE"),
            EntityType::Language => String::from("LANGUAGE")
        }
    }
}

pub const ARTICLE: EntityType = EntityType::Article;
pub const LANGUAGE: EntityType = EntityType::Language;
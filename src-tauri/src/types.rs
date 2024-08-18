use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum EntityType {
    None,
    Article,
    Language
}

impl EntityType {
    pub fn code(&self) -> i8 {
        match self {
            EntityType::None => 0,
            EntityType::Article => 1,
            EntityType::Language => 2,
        }
    }
}

pub const ARTICLE: EntityType = EntityType::Article;
pub const LANGUAGE: EntityType = EntityType::Language;
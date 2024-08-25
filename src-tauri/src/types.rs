use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum EntityType {
    None,
    Article,
    Language,
    Word,
    Person,
}

impl EntityType {
    pub fn code(&self) -> i8 {
        match self {
            EntityType::None => 0,
            EntityType::Article => 1,
            EntityType::Language => 2,
            EntityType::Word => 3,
            EntityType::Person => 4,
        }
    }
}

pub const ARTICLE: EntityType = EntityType::Article;
pub const LANGUAGE: EntityType = EntityType::Language;
pub const PERSON: EntityType = EntityType::Person;

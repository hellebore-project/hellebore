use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum EntityType {
    None,
    Folder,
    Article,
    Language,
    Word,
    Person,
}

impl EntityType {
    pub fn code(&self) -> i8 {
        match self {
            EntityType::None => 0,
            EntityType::Folder => 1,
            EntityType::Article => 2,
            EntityType::Language => 3,
            EntityType::Word => 4,
            EntityType::Person => 5,
        }
    }
}

pub const FOLDER: EntityType = EntityType::Folder;
pub const ARTICLE: EntityType = EntityType::Article;
pub const LANGUAGE: EntityType = EntityType::Language;
pub const PERSON: EntityType = EntityType::Person;

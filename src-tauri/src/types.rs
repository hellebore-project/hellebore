use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum EntityType {
    None,
    Session,
    Project,
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

            // Core
            EntityType::Session => 1,
            EntityType::Project => 2,
            EntityType::Folder => 3,
            EntityType::Article => 4,

            // Dictionary
            EntityType::Language => 10,
            EntityType::Word => 11,

            // Calendar
            // TODO

            // Encyclopedia
            EntityType::Person => 30,
        }
    }
}

pub const SESSION: EntityType = EntityType::Session;
pub const PROJECT: EntityType = EntityType::Project;
pub const FOLDER: EntityType = EntityType::Folder;
pub const ARTICLE: EntityType = EntityType::Article;
pub const LANGUAGE: EntityType = EntityType::Language;
pub const PERSON: EntityType = EntityType::Person;

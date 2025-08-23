use std::convert::From;

use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use serde_repr::{Deserialize_repr, Serialize_repr};

use crate::utils::CodedEnum;

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
pub enum EntityType {
    None = 0,

    // Core
    Session = 1,
    Project = 2,
    Folder = 3,
    Entry = 4,

    // Dictionary
    Language = 10,
    Word = 11,

    // Calendar
    // TODO

    // Encyclopedia
    Person = 30,
}

pub const SESSION: EntityType = EntityType::Session;
pub const PROJECT: EntityType = EntityType::Project;
pub const FOLDER: EntityType = EntityType::Folder;
pub const ENTRY: EntityType = EntityType::Entry;
pub const LANGUAGE: EntityType = EntityType::Language;
pub const WORD: EntityType = EntityType::Word;
pub const PERSON: EntityType = EntityType::Person;

impl CodedEnum for EntityType {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl From<i8> for EntityType {
    fn from(code: i8) -> Self {
        for value in Self::iter() {
            if code == value.code() {
                return value;
            }
        }
        panic!("Not implemented")
    }
}

impl PartialEq for EntityType {
    fn eq(&self, other: &Self) -> bool {
        self.code() == other.code()
    }
}

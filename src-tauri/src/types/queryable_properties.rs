use serde_repr::{Deserialize_repr, Serialize_repr};
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use crate::utils::CodedEnum;

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
#[derive(Default)]
pub enum QueryableEntryProperties {
    #[default]
    None = 0,
    Id = 1,
    FolderId = 2,
    EntityType = 3,
    Title = 4,
}

impl CodedEnum for QueryableEntryProperties {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl From<i8> for QueryableEntryProperties {
    fn from(code: i8) -> Self {
        for value in Self::iter() {
            if code == value.code() {
                return value;
            }
        }
        panic!("Not implemented")
    }
}

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
#[derive(Default)]
pub enum QueryableWordProperties {
    #[default]
    None = 0,
    Id = 1,
    LanguageId = 2,
    WordType = 3,
    Spelling = 4,
    Definition = 5,
    Translations = 6,
}

impl CodedEnum for QueryableWordProperties {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl From<i8> for QueryableWordProperties {
    fn from(code: i8) -> Self {
        for value in Self::iter() {
            if code == value.code() {
                return value;
            }
        }
        panic!("Not implemented")
    }
}

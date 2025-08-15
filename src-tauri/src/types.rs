use std::convert::From;

use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use serde_repr::{Deserialize_repr, Serialize_repr};

pub trait CodedEnum {
    fn code(&self) -> i8;
}

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

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
pub enum WordType {
    None = 0,
    RootWord = 1,
    Article = 11,
    Preposition = 12,
    Conjunction = 13,
    Pronoun = 21,
    Noun = 31,
    Adjective = 41,
    Adverb = 42,
    Verb = 51,
}

impl CodedEnum for WordType {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl Default for WordType {
    fn default() -> Self {
        Self::None
    }
}

impl From<i8> for WordType {
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
pub enum GrammaticalNumber {
    None = 0,
    Singular = 1,
    Dual = 2,
    Trial = 3,
    Quadral = 4,
    Quintal = 5,
    Paucal = 11,
    GreaterPaucal = 12,
    Plural = 21,
    GreaterPlural = 22,
    GreatestPlural = 23,
}

impl CodedEnum for GrammaticalNumber {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl Default for GrammaticalNumber {
    fn default() -> Self {
        Self::None
    }
}

impl From<i8> for GrammaticalNumber {
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
pub enum GrammaticalGender {
    None = 0,
    Neutral = 1,
    Masculine = 11,
    Feminine = 12,
}

impl CodedEnum for GrammaticalGender {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl Default for GrammaticalGender {
    fn default() -> Self {
        Self::None
    }
}

impl From<i8> for GrammaticalGender {
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
pub enum GrammaticalPerson {
    None = 0,
    First = 1,
    Second = 2,
    Third = 3,
}

impl CodedEnum for GrammaticalPerson {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl Default for GrammaticalPerson {
    fn default() -> Self {
        Self::None
    }
}

impl From<i8> for GrammaticalPerson {
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
pub enum VerbForm {
    None = 0,
    Infinitive = 1,
    Finite = 2,
}

impl CodedEnum for VerbForm {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl Default for VerbForm {
    fn default() -> Self {
        Self::None
    }
}

impl From<i8> for VerbForm {
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
pub enum VerbTense {
    None = 0,
    Present = 1,
    Past = 11,
    Future = 21,
}

impl CodedEnum for VerbTense {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl Default for VerbTense {
    fn default() -> Self {
        Self::None
    }
}

impl From<i8> for VerbTense {
    fn from(code: i8) -> Self {
        for value in Self::iter() {
            if code == value.code() {
                return value;
            }
        }
        panic!("Not implemented")
    }
}

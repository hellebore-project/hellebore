use std::convert::From;

use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use serde_repr::{Deserialize_repr, Serialize_repr};

use crate::utils::CodedEnum;

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
#[derive(Default)]
pub enum WordType {
    #[default]
    None = 0,
    RootWord = 1,
    Determiner = 11,
    Preposition = 12,
    Conjunction = 13,
    Pronoun = 21,
    Noun = 31,
    Adjective = 41,
    Adverb = 51,
    Verb = 61,
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

impl std::fmt::Display for WordType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            WordType::None => "None",
            WordType::RootWord => "RootWord",
            WordType::Determiner => "Determiner",
            WordType::Preposition => "Preposition",
            WordType::Conjunction => "Conjunction",
            WordType::Pronoun => "Pronoun",
            WordType::Noun => "Noun",
            WordType::Adjective => "Adjective",
            WordType::Adverb => "Adverb",
            WordType::Verb => "Verb",
        };
        write!(f, "{}", s)
    }
}

impl CodedEnum for WordType {
    fn code(&self) -> i8 {
        *self as i8
    }
}

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
#[derive(Default)]
pub enum GrammaticalNumber {
    #[default]
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
#[derive(Default)]
pub enum GrammaticalGender {
    #[default]
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
#[derive(Default)]
pub enum GrammaticalPerson {
    #[default]
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
#[derive(Default)]
pub enum VerbForm {
    #[default]
    None = 0,
    Infinitive = 1,
    Finite = 2,
}

impl CodedEnum for VerbForm {
    fn code(&self) -> i8 {
        *self as i8
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
#[derive(Default)]
pub enum VerbTense {
    #[default]
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

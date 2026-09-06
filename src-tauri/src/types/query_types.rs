use serde_repr::{Deserialize_repr, Serialize_repr};
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use crate::utils::CodedEnum;

#[derive(Copy, Clone, Debug, EnumIter, Serialize_repr, Deserialize_repr)]
#[repr(i8)]
#[derive(Default)]
pub enum SortOrder {
    #[default]
    None = 0,
    Asc = 10,
    Desc = 20,
}

impl CodedEnum for SortOrder {
    fn code(&self) -> i8 {
        *self as i8
    }
}

impl From<i8> for SortOrder {
    fn from(code: i8) -> Self {
        for value in Self::iter() {
            if code == value.code() {
                return value;
            }
        }
        panic!("Not implemented")
    }
}

impl PartialEq for SortOrder {
    fn eq(&self, other: &Self) -> bool {
        self.code() == other.code()
    }
}

use sea_orm::entity::{ActiveValue, Value};

use crate::types::CodedType;

pub fn optional_value_to_active_value<V>(value: Option<V>) -> ActiveValue<V>
where
    V: Into<Value>,
{
    match value {
        Some(v) => ActiveValue::Set(v),
        None => ActiveValue::NotSet,
    }
}

pub fn optional_type_to_active_value<V>(value: Option<V>) -> ActiveValue<i8>
where
    V: CodedType,
{
    match value {
        Some(v) => ActiveValue::Set(v.code()),
        None => ActiveValue::NotSet,
    }
}

use sea_orm::entity::{ActiveValue, Value};

use crate::types::CodedEnum;

pub fn set_value_or_null<V>(value: Option<V>) -> ActiveValue<V>
where
    V: Into<Value>,
{
    match value {
        Some(v) => ActiveValue::Set(v),
        None => ActiveValue::NotSet,
    }
}

pub fn set_value_or_default<V>(value: Option<V>) -> ActiveValue<V>
where
    V: Into<Value> + Default,
{
    match value {
        Some(v) => ActiveValue::Set(v),
        None => ActiveValue::Set(V::default()),
    }
}

pub fn set_type_or_null<V>(value: Option<V>) -> ActiveValue<i8>
where
    V: CodedEnum,
{
    match value {
        Some(v) => ActiveValue::Set(v.code()),
        None => ActiveValue::NotSet,
    }
}

pub fn set_type_or_default<V>(value: Option<V>) -> ActiveValue<i8>
where
    V: CodedEnum + Default,
{
    match value {
        Some(v) => ActiveValue::Set(v.code()),
        None => ActiveValue::Set(V::default().code()),
    }
}

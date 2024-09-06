use sea_orm::entity::{ActiveValue, Value};

pub fn optional_value_to_active_value<V>(value: Option<V>) -> ActiveValue<V>
where
    V: Into<Value>,
{
    match value {
        Some(v) => ActiveValue::Set(v),
        None => ActiveValue::NotSet,
    }
}

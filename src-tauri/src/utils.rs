// TODO move to types
pub trait CodedEnum {
    fn code(&self) -> i8;
}

pub fn value_or_default<T: Default>(value: Option<T>) -> T {
    if value.is_some() {
        value.unwrap()
    } else {
        T::default()
    }
}

pub fn string_or_none<S: ToString>(value: Option<S>) -> Option<String> {
    match value {
        Some(v) => Some(v.to_string()),
        None => None,
    }
}

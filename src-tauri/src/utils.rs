pub fn value_or_default<T: Default>(value: Option<T>) -> T {
    if value.is_some() {
        value.unwrap()
    } else {
        T::default()
    }
}

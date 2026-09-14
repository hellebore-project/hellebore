pub trait CodedEnum: Copy {
    fn code(&self) -> i8;
}

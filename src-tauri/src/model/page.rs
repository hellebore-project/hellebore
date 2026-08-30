pub struct Page<T> {
    pub items: Vec<T>,
    pub item_count: u64,
    pub page_index: u64,
    pub page_count: Option<u64>,
    pub total: Option<u64>,
    pub offset: Option<u64>,
    pub limit: Option<u64>,
}

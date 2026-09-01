pub mod pagination_service;

pub mod config_service;

pub mod project_service;

pub mod folder_service;

pub mod entry;
pub use entry::{entry_service, entry_text_service};

pub mod language_service;
pub mod word;
pub use word::word_service;

pub mod person_service;

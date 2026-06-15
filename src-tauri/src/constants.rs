use uuid::Uuid;

pub const ROOT_FOLDER_ID: Uuid = Uuid::nil();
pub const ENTITY_ID_SENTINEL: Uuid = Uuid::nil();

pub const DATA_DIR_NAME: &str = ".hellebore";
pub const APP_CONFIG_FILE_NAME: &str = "hellebore.config.json";

pub const PROJECT_CONFIG_FILE_NAME: &str = "hellebore.project.json";
pub const DEFAULT_DB_FILE_NAME: &str = "db.sqlite";

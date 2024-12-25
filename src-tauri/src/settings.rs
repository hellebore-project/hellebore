use std::env;
use std::fs;

use crate::schema::config::{ConfigSchema, SessionSchema};

pub const DATA_DIR_NAME: &str = ".hellebore";
pub const DEFAULT_DB_FILE_NAME: &str = "db.sqlite";
pub const CONFIG_FILE_NAME: &str = "hellebore.config.json";

pub struct DatabaseSettings {
    pub file_path: String,
    pub in_memory: bool,
}

impl DatabaseSettings {
    pub fn get_connection_string(&self) -> String {
        if self.in_memory {
            return "sqlite::memory:".to_string();
        }
        format!("sqlite://{0}?mode=rwc", self.file_path)
    }
}

pub struct Settings {
    pub data_dir_path: String,
    pub database: DatabaseSettings,
}

impl Settings {
    pub fn new() -> Self {
        let data_dir_path = Self::get_data_dir_path();

        let config = Self::read_config_file(&data_dir_path);

        let db_file_path = match config.session.db_file_path {
            Some(val) => val,
            None => {
                let db_file_name = match env::var("HELLEBORE_DEFAULT_DB_FILE") {
                    Ok(val) => val,
                    Err(_e) => DEFAULT_DB_FILE_NAME.to_string(),
                };
                format!("{data_dir_path}/{db_file_name}")
            }
        };

        let db_settings = DatabaseSettings {
            file_path: db_file_path,
            in_memory: false,
        };

        Self {
            data_dir_path,
            database: db_settings,
        }
    }

    fn get_data_dir_path() -> String {
        let data_dir_path = match env::var("HELLEBORE_DATA_DIR") {
            Ok(val) => val,
            Err(_e) => {
                let home_dir_path = match env::var("HOME") {
                    Ok(val) => val,
                    Err(_e) => ".".to_string(),
                };
                format!("{home_dir_path}/{DATA_DIR_NAME}")
            }
        };
        fs::create_dir_all(&data_dir_path).expect("Failed to create data directory.");
        return data_dir_path;
    }

    fn get_config_file_path(&self) -> String {
        format!("{0}/{1}", self.data_dir_path, CONFIG_FILE_NAME)
    }

    fn to_config(&self) -> ConfigSchema {
        ConfigSchema {
            session: SessionSchema {
                db_file_path: Some(self.database.file_path.clone()),
            },
        }
    }

    fn read_config_file(data_dir_path: &str) -> ConfigSchema {
        let config_file_path = format!("{data_dir_path}/{CONFIG_FILE_NAME}");
        let config_text = match fs::read_to_string(&config_file_path) {
            Ok(val) => val,
            Err(_e) => {
                println!("Config file not found at {config_file_path}");
                "{}".to_string()
            }
        };
        let config: ConfigSchema = match serde_json::from_str(&config_text) {
            Ok(val) => val,
            Err(_e) => {
                println!("Failed to parse config file at {config_file_path}");
                ConfigSchema {
                    session: SessionSchema { db_file_path: None },
                }
            }
        };
        return config;
    }

    pub fn write_config_file(&self) {
        let config_file_path = self.get_config_file_path();
        let config = self.to_config();
        let config_text = match serde_json::to_string(&config) {
            Ok(val) => val,
            Err(_e) => {
                println!("Failed to serialize config.");
                "{}".to_string()
            }
        };
        match fs::write(&config_file_path, &config_text) {
            Ok(_) => (),
            Err(_e) => println!("Failed to write config file at {config_file_path}"),
        };
    }
}

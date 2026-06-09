use std::env;
use std::fs;

use crate::{
    model::{
        config::{AppConfig, DatabaseConfig},
        errors::Error,
    },
    schema::config::{AppConfigFileSchema, SessionSchema},
};

pub const DATA_DIR_NAME: &str = ".hellebore";
pub const DEFAULT_DB_FILE_NAME: &str = "db.sqlite";
pub const CONFIG_FILE_NAME: &str = "hellebore.config.json";

pub fn get_user_data_dir_path() -> Result<String, Error> {
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

    fs::create_dir_all(&data_dir_path).map_err(|e| Error::FileSystemOperationFailed {
        msg: "Failed to create user data directory".to_string(),
        error: e.to_string(),
    })?;

    Ok(data_dir_path)
}

pub fn get_user_config_file_path() -> Result<String, Error> {
    Ok(format!(
        "{0}/{1}",
        get_user_data_dir_path()?,
        CONFIG_FILE_NAME
    ))
}

pub fn load_app_config() -> Result<AppConfig, Error> {
    let data_dir_path = get_user_config_file_path()?;

    let config_file = read_app_config_from_file(&data_dir_path);

    let config = match config_file {
        Ok(val) => AppConfig {
            folder_path: val.session.folder_path,
            database: DatabaseConfig { in_memory: false },
        },
        Err(_) => AppConfig::default(),
    };

    Ok(config)
}

pub fn to_app_config_file_schema(config: &AppConfig) -> AppConfigFileSchema {
    AppConfigFileSchema {
        session: SessionSchema {
            folder_path: config.folder_path.clone(),
        },
    }
}

pub fn read_app_config_from_file(data_dir_path: &str) -> Result<AppConfigFileSchema, Error> {
    let config_file_path = format!("{data_dir_path}/{CONFIG_FILE_NAME}");

    let exists = fs::metadata(&config_file_path).is_ok();

    if !exists {
        return Ok(AppConfigFileSchema {
            session: SessionSchema { folder_path: None },
        });
    }

    let config_text = match fs::read_to_string(&config_file_path) {
        Ok(val) => val,
        Err(e) => {
            return Err(Error::FileSystemOperationFailed {
                msg: "Failed to read app config file".to_string(),
                error: e.to_string(),
            });
        }
    };

    match serde_json::from_str(&config_text) {
        Ok(val) => Ok(val),
        Err(e) => Err(Error::ConfigDeserializationFailed {
            msg: "Failed to deserialize app config file".to_string(),
            error: e.to_string(),
        }),
    }
}

pub fn write_app_config_to_file(config: &AppConfig) -> Result<(), Error> {
    let config_file_path = get_user_config_file_path()?;

    let config = to_app_config_file_schema(config);
    let config_text = match serde_json::to_string(&config) {
        Ok(val) => val,
        Err(e) => {
            return Err(Error::ConfigSerializationFailed {
                msg: "Failed to serialize app config".to_string(),
                error: e.to_string(),
            });
        }
    };

    match fs::write(&config_file_path, &config_text) {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::FileSystemOperationFailed {
            msg: "Failed to write app config to file".to_string(),
            error: e.to_string(),
        }),
    }
}

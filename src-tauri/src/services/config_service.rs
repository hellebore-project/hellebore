use std::env;
use std::fs;

use crate::{
    constants::{APP_CONFIG_FILE_NAME, DATA_DIR_NAME},
    model::{config::AppConfig, errors::Error},
    schema::config::AppConfigFileSchema,
};

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
        APP_CONFIG_FILE_NAME
    ))
}

pub fn load_app_config() -> Result<AppConfig, Error> {
    let config_file_path = get_user_config_file_path()?;

    let config_file = _read_app_config_from_file(&config_file_path);

    let config = match config_file {
        Ok(config_file) => AppConfig {
            recent_project_paths: config_file.recent_projects,
        },
        Err(_) => AppConfig::default(),
    };

    Ok(config)
}

fn _read_app_config_from_file(config_file_path: &str) -> Result<AppConfigFileSchema, Error> {
    let exists = fs::metadata(config_file_path).is_ok();

    if !exists {
        return Ok(AppConfigFileSchema {
            recent_projects: Vec::new(),
        });
    }

    let config_text = match fs::read_to_string(config_file_path) {
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

pub fn save_app_config(config: &AppConfig) -> Result<(), Error> {
    let config_file_path = get_user_config_file_path()?;

    let config_file = AppConfigFileSchema {
        recent_projects: config.recent_project_paths.clone(),
    };

    _write_app_config_to_file(&config_file, &config_file_path)
}

fn _write_app_config_to_file(config: &AppConfigFileSchema, file_path: &str) -> Result<(), Error> {
    let config_text = match serde_json::to_string(&config) {
        Ok(val) => val,
        Err(e) => {
            return Err(Error::ConfigSerializationFailed {
                msg: "Failed to serialize app config".to_string(),
                error: e.to_string(),
            });
        }
    };

    match fs::write(file_path, &config_text) {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::FileSystemOperationFailed {
            msg: "Failed to write app config to file".to_string(),
            error: e.to_string(),
        }),
    }
}

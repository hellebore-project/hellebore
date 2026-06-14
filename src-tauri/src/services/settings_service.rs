use std::env;
use std::fs;

use crate::model::settings::Settings;
use crate::schema::settings::SettingsFileSchema;

pub const CONFIG_FILE_NAME: &str = "hellebore.config.json";

pub fn fetch() -> Settings {
    let data_dir_path = get_data_dir_path();
    let settings_file = read_from_file(&data_dir_path);

    Settings {
        recent_projects: settings_file.recent_projects,
    }
}

pub fn add_recent_project(settings: &mut Settings, path: &str) {
    settings.add_recent_project(path);
    write_to_file(settings);
}

fn read_from_file(data_dir_path: &str) -> SettingsFileSchema {
    let settings_file_path = format!("{data_dir_path}/{CONFIG_FILE_NAME}");
    let file_text = match fs::read_to_string(&settings_file_path) {
        Ok(val) => val,
        Err(_e) => {
            println!("Config file not found at {settings_file_path}");
            "{}".to_string()
        }
    };
    let file_schema: SettingsFileSchema = match serde_json::from_str(&file_text) {
        Ok(val) => val,
        Err(_e) => {
            println!("Failed to parse config file at {settings_file_path}");
            SettingsFileSchema {
                recent_projects: vec![],
            }
        }
    };
    return file_schema;
}

pub fn write_to_file(settings: &Settings) {
    let data_dir_path = get_data_dir_path();
    let settings_file_path = Settings::get_config_file_path(&data_dir_path);
    let file_schema = to_file_schema(settings);
    let file_text = match serde_json::to_string(&file_schema) {
        Ok(val) => val,
        Err(_e) => {
            println!("Failed to serialize config.");
            "{}".to_string()
        }
    };
    match fs::write(&settings_file_path, &file_text) {
        Ok(_) => (),
        Err(_e) => println!("Failed to write config file at {settings_file_path}"),
    };
}

pub fn get_data_dir_path() -> Result<String> {
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

    if !fs::exists(&data_dir_path)? {
        fs::create_dir_all(&data_dir_path).expect("Failed to create data directory.");
    }

    Ok(data_dir_path)
}

fn to_file_schema(settings: &Settings) -> SettingsFileSchema {
    SettingsFileSchema {
        recent_projects: settings.recent_projects.clone(),
    }
}

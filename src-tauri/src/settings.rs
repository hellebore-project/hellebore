use std::env;
use std::fs;

pub struct DatabaseSettings {
    pub db_file_path: String,
    pub connection_string: String,
}

pub struct Settings {
    pub data_dir_path: String,
    pub database: DatabaseSettings,
}

pub fn get_settings() -> Settings {
    let data_dir_path = match env::var("FANTASY_LOG_DATA_DIR") {
        Ok(val) => val,
        Err(_e) => {
            let home_dir_path = match env::var("HOME") {
                Ok(val) => val,
                Err(_e) => ".".to_string(),
            };
            format!("{home_dir_path}/.fantasy_log")
        },
    };
    fs::create_dir_all(&data_dir_path).expect("Failed to create data directory.");

    let db_file_name = match env::var("FANTASY_LOG_DB_FILE") {
        Ok(val) => val,
        Err(_e) => "db.sqlite".to_string(),
    };

    let db_file_path = format!("{data_dir_path}/{db_file_name}");

    let conn_str = match env::var("FANTASY_LOG_CONNECTION_STRING") {
        Ok(val) => val,
        Err(_e) => format!("sqlite://{db_file_path}?mode=rwc"),
    };

    Settings {
        data_dir_path,
        database: DatabaseSettings {
            db_file_path,
            connection_string: conn_str,
        },
    }
}
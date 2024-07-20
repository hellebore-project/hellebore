use sea_orm::{Database, DatabaseConnection};

use crate::settings::{Settings, get_settings};

pub struct AppState {
    pub settings: Settings,
    pub database: DatabaseConnection
}

pub async fn build_app() -> AppState {
    let settings = get_settings();

    let conn_str = &settings.database.connection_string;
    let db =
        Database::connect(conn_str)
        .await
        .expect(&format!("Failed to connect to the sqlite database at {conn_str}.")); 

    AppState {
        settings,
        database: db
    }
}
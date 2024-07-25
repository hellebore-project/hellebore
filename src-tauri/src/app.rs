use sea_orm::DatabaseConnection;

use crate::services::database;
use crate::settings::{Settings, get_settings};

pub struct AppState {
    pub settings: Settings,
    pub database: DatabaseConnection
}

pub async fn build_app() -> AppState {
    let settings = get_settings();
    let db = database::setup(&settings).await;
    AppState {
        settings,
        database: db
    }
}
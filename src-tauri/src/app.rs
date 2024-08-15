use sea_orm::DatabaseConnection;

use crate::database::database_manager;
use crate::settings::Settings;

pub struct AppState {
    pub settings: Settings,
    pub database: DatabaseConnection
}

pub async fn setup(settings: Settings) -> AppState {
    let db = database_manager::setup(&settings).await;
    AppState {
        settings,
        database: db
    }
}
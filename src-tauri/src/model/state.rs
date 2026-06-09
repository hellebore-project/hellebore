use tokio::sync::{Mutex, MutexGuard};

use sea_orm::DatabaseConnection;

use crate::model::config::AppConfig;

pub struct StateData {
    pub config: AppConfig,
    pub database: Option<DatabaseConnection>,
}

pub struct State {
    pub data: Mutex<StateData>,
}

impl State {
    pub fn new(config: AppConfig, database: Option<DatabaseConnection>) -> Self {
        Self {
            data: Mutex::new(StateData { config, database }),
        }
    }

    pub async fn lock(&self) -> MutexGuard<'_, StateData> {
        self.data.lock().await
    }
}

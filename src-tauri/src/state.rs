use tokio::sync::{Mutex, MutexGuard};

use sea_orm::DatabaseConnection;

use crate::settings::Settings;

pub struct StateData {
    pub settings: Settings,
    pub database: Option<DatabaseConnection>,
}

pub struct State {
    pub data: Mutex<StateData>,
}

impl State {
    pub fn new(settings: Settings, database: Option<DatabaseConnection>) -> Self {
        Self {
            data: Mutex::new(StateData { settings, database }),
        }
    }

    pub async fn lock(&self) -> MutexGuard<'_, StateData> {
        self.data.lock().await
    }
}

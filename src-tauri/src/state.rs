use tokio::sync::{Mutex, MutexGuard};

use sea_orm::DatabaseConnection;

use crate::settings::Settings;

pub struct StateData {
    pub settings: Settings,
    pub database: DatabaseConnection,
}

pub struct State {
    pub data: Mutex<StateData>,
}

impl State {
    pub fn new(settings: Settings, database: DatabaseConnection) -> Self {
        Self {
            data: Mutex::new(StateData { settings, database }),
        }
    }

    pub async fn get_data(&self) -> MutexGuard<'_, StateData> {
        self.data.lock().await
    }
}

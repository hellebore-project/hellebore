use std::collections::HashMap;

use tokio::sync::{Mutex, MutexGuard};
use uuid::Uuid;

use crate::model::{config::AppConfig, project::Project};

pub struct StateData {
    pub config: AppConfig,
    pub projects: HashMap<Uuid, Project>,
}

impl StateData {
    pub fn add_project(&mut self, project: Project) -> Uuid {
        self.config.add_recent_project(&project.folder_path);

        let id = project.id;
        self.projects.insert(id, project);

        id
    }

    pub fn remove_project(&mut self, id: Uuid) -> Option<Project> {
        self.projects.remove(&id)
    }

    pub fn get_project(&self, id: Uuid) -> Option<&Project> {
        self.projects.get(&id)
    }

    pub fn get_project_mut(&mut self, id: Uuid) -> Option<&mut Project> {
        self.projects.get_mut(&id)
    }

    pub fn get_project_id_of_path(&self, folder_path: &str) -> Option<Uuid> {
        self.projects
            .values()
            .find(|p| p.folder_path == folder_path)
            .map(|p| p.id)
    }
}

pub struct State {
    pub data: Mutex<StateData>,
}

impl State {
    pub fn new(config: AppConfig) -> Self {
        Self {
            data: Mutex::new(StateData {
                config,
                projects: HashMap::new(),
            }),
        }
    }

    pub async fn lock(&self) -> MutexGuard<'_, StateData> {
        self.data.lock().await
    }
}

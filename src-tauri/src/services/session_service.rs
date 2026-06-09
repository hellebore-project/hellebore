use sea_orm::DatabaseConnection;

use crate::model::{config::AppConfig, errors::Error};
use crate::schema::project::ProjectResponseSchema;
use crate::schema::session::SessionResponseSchema;
use crate::services::project_service;

pub async fn get(
    database: Option<&DatabaseConnection>,
    config: &AppConfig,
) -> Result<SessionResponseSchema, Error> {
    let project = match database {
        Some(db) => project_service::get(db).await?,
        None => None,
    };
    Ok(generate_response(&project, config))
}

pub fn generate_response(
    project: &Option<ProjectResponseSchema>,
    config: &AppConfig,
) -> SessionResponseSchema {
    SessionResponseSchema {
        folder_path: config.folder_path.clone(),
        project: project.clone(),
    }
}

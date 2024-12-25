use sea_orm::DatabaseConnection;

use crate::errors::ApiError;
use crate::schema::project::ProjectResponseSchema;
use crate::schema::session::SessionResponseSchema;
use crate::services::project_service;
use crate::settings::Settings;
use crate::types::PROJECT;

pub async fn get(
    database: &DatabaseConnection,
    settings: &Settings,
) -> Result<SessionResponseSchema, ApiError> {
    let project = project_service::get(database).await?;
    let project = match project {
        Some(project) => project,
        None => {
            return Err(ApiError::not_found(
                "Project not found.".to_owned(),
                PROJECT,
            ))
        }
    };
    return Ok(generate_response(&project, settings));
}

pub fn generate_response(
    project: &ProjectResponseSchema,
    settings: &Settings,
) -> SessionResponseSchema {
    SessionResponseSchema {
        db_file_path: settings.database.file_path.clone(),
        project: project.clone(),
    }
}

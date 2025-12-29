use sea_orm::DatabaseConnection;

use crate::model::errors::api_error::ApiError;
use crate::schema::project::ProjectResponseSchema;
use crate::schema::session::SessionResponseSchema;
use crate::services::project_service;
use crate::settings::Settings;

pub async fn get(
    database: Option<&DatabaseConnection>,
    settings: &Settings,
) -> Result<SessionResponseSchema, ApiError> {
    let project = match database {
        Some(db) => project_service::get(db).await?,
        None => None,
    };
    return Ok(generate_response(&project, settings));
}

pub fn generate_response(
    project: &Option<ProjectResponseSchema>,
    settings: &Settings,
) -> SessionResponseSchema {
    SessionResponseSchema {
        db_file_path: settings.database.file_path.clone(),
        project: project.clone(),
    }
}

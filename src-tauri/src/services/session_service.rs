use sea_orm::DatabaseConnection;

use crate::model::errors::error::Error;
use crate::schema::project::ProjectResponseSchema;
use crate::schema::session::SessionResponseSchema;
use crate::services::project_service;
use crate::settings::Settings;

pub async fn get(
    database: Option<&DatabaseConnection>,
    settings: &Settings,
) -> Result<SessionResponseSchema, Error> {
    let project = match database {
        Some(db) => project_service::get(db).await?,
        None => None,
    };
    Ok(generate_response(&project, settings))
}

pub fn generate_response(
    project: &Option<ProjectResponseSchema>,
    settings: &Settings,
) -> SessionResponseSchema {
    SessionResponseSchema {
        folder_path: settings.folder_path.clone(),
        project: project.clone(),
    }
}

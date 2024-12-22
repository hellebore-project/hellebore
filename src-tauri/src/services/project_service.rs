use sea_orm::DatabaseConnection;

use ::entity::project::Model as Project;

use crate::database::project_manager;
use crate::errors::ApiError;
use crate::schema::project::ProjectResponseSchema;
use crate::types::PROJECT;

pub async fn create(
    database: &DatabaseConnection,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    return match project_manager::insert(&database, name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_inserted(e, PROJECT)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let project = match get(&database).await? {
        Some(project) => project,
        None => {
            return Err(ApiError::not_found(
                "Project not found.".to_owned(),
                PROJECT,
            ))
        }
    };
    return match project_manager::update(&database, project.id, &name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_updated(e, PROJECT)),
    };
}

pub async fn get(database: &DatabaseConnection) -> Result<Option<ProjectResponseSchema>, ApiError> {
    let mut projects = get_all(&database).await?;
    if projects.is_empty() {
        return Ok(None);
    }
    let project = projects.remove(0);
    Ok(Some(project))
}

pub async fn get_all(
    database: &DatabaseConnection,
) -> Result<Vec<ProjectResponseSchema>, ApiError> {
    let projects = project_manager::get_all(&database)
        .await
        .map_err(|e| ApiError::not_found(e, PROJECT))?;
    let projects = projects.iter().map(generate_response).collect();
    return Ok(projects);
}

pub fn generate_response(project: &Project) -> ProjectResponseSchema {
    ProjectResponseSchema {
        id: project.id,
        name: project.name.to_string(),
    }
}

use sea_orm::DatabaseConnection;

use ::entity::project::Model as Project;
use tokio::sync::MutexGuard;

use crate::database::{database_manager, project_manager};
use crate::errors::ApiError;
use crate::schema::project::{ProjectLoadResponseSchema, ProjectResponseSchema};
use crate::settings::Settings;
use crate::state::StateData;
use crate::types::PROJECT;

pub async fn create(
    state: &mut MutexGuard<'_, StateData>,
    name: &str,
    db_path: &str,
) -> Result<ProjectLoadResponseSchema, ApiError> {
    state.settings.database.file_path = Some(db_path.to_string());
    state.settings.write_config_file();

    let db = database_manager::setup(&state.settings).await?;

    // TODO: fall back to an error state in the UI if the query fails
    let mut projects = _get_all_records(&db).await?;

    let project;
    if projects.is_empty() {
        project = _create_record(&db, name).await?;
    } else {
        project = projects.remove(0);
    }

    Ok(ProjectLoadResponseSchema { info: project, db })
}

pub async fn load(
    state: &mut MutexGuard<'_, StateData>,
    db_path: &str,
) -> Result<ProjectLoadResponseSchema, ApiError> {
    state.settings.database.file_path = Some(db_path.to_string());
    state.settings.write_config_file();

    let db = database_manager::setup(&state.settings).await?;
    let project = match get(&db).await? {
        Some(project) => project,
        None => {
            return Err(ApiError::not_found(
                "Project not found.".to_owned(),
                PROJECT,
            ))
        }
    };
    Ok(ProjectLoadResponseSchema { info: project, db })
}

pub async fn close(state: &mut MutexGuard<'_, StateData>) -> Result<(), ApiError> {
    state.settings.database.file_path = None;
    state.settings.write_config_file();
    Ok(())
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
    let mut projects = _get_all_records(&database).await?;
    if projects.is_empty() {
        return Ok(None);
    }
    let project = projects.remove(0);
    Ok(Some(project))
}

pub async fn _create_record(
    database: &DatabaseConnection,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    return match project_manager::insert(&database, name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_inserted(e, PROJECT)),
    };
}

pub async fn _get_all_records(
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

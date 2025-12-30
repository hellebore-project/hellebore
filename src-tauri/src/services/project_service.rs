use sea_orm::DatabaseConnection;
use tokio::sync::MutexGuard;

use ::entity::project::Model as Project;

use crate::database::{project_manager, setup};
use crate::model::errors::api_error::ApiError;
use crate::schema::project::{ProjectLoadResponseSchema, ProjectResponseSchema};
use crate::state::StateData;
use crate::types::entity::PROJECT;

pub async fn create(
    state: &mut MutexGuard<'_, StateData>,
    name: &str,
    db_path: &str,
) -> Result<ProjectLoadResponseSchema, ApiError> {
    println!("Initializing project");

    state.settings.database.file_path = Some(db_path.to_string());
    state.settings.write_config_file();

    let db = setup::setup(&state.settings).await?;

    let mut projects = get_all(&db).await?;

    let project: ProjectResponseSchema;
    if projects.is_empty() {
        println!("No project found; creating new project '{name}'");
        project = match project_manager::insert(&db, &name).await {
            Ok(entity) => generate_response(&entity),
            Err(e) => {
                return Err(ApiError::not_created("Project not created.", PROJECT).from_error(e));
            }
        };
    } else {
        project = projects.remove(0);
        let _name = project.name.to_owned();
        println!("Found existing project '{_name}'");
    }

    Ok(ProjectLoadResponseSchema { info: project, db })
}

pub async fn load(
    state: &mut MutexGuard<'_, StateData>,
    db_path: &str,
) -> Result<ProjectLoadResponseSchema, ApiError> {
    state.settings.database.file_path = Some(db_path.to_string());
    state.settings.write_config_file();

    let db = setup::setup(&state.settings).await?;
    let project = match get(&db).await? {
        Some(project) => project,
        None => {
            return Err(ApiError::not_found("Project not found.", PROJECT));
        }
    };
    Ok(ProjectLoadResponseSchema { info: project, db })
}

pub async fn close(state: &mut MutexGuard<'_, StateData>) -> Result<(), ApiError> {
    state.settings.database.file_path = None;
    state.settings.write_config_file();
    state.database = None;
    Ok(())
}

pub async fn update(
    database: &DatabaseConnection,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let project = match get(&database).await? {
        Some(project) => project,
        None => {
            return Err(ApiError::not_found("Project not found.", PROJECT));
        }
    };
    return match project_manager::update(database, project.id, &name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_updated("Project not updated.", PROJECT).from_error(e)),
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
    let projects = project_manager::get_all(database).await.map_err(|e| {
        ApiError::db(
            "Failed to query project table while fetching all projects.",
            e,
        )
    })?;
    let projects = projects.iter().map(generate_response).collect();
    return Ok(projects);
}

pub fn generate_response(project: &Project) -> ProjectResponseSchema {
    ProjectResponseSchema {
        id: project.id,
        name: project.name.to_string(),
    }
}

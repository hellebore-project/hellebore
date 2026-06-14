use sea_orm::DatabaseConnection;
use std::fs;
use tokio::sync::MutexGuard;
use uuid::Uuid;

use crate::constants::PROJECT_CONFIG_FILE_NAME;
use crate::database::setup::setup_db;
use crate::model::{
    errors::{Error, ErrorBuilder},
    project::{DatabaseConfig, Project},
    state::StateData,
};
use crate::schema::project::{ProjectConfigFileSchema, ProjectResponseSchema};
use crate::services::config_service;
use crate::types::entity::PROJECT;

pub async fn create(
    state: &mut MutexGuard<'_, StateData>,
    name: &str,
    folder_path: &str,
    in_memory: bool,
) -> Result<ProjectResponseSchema, Error> {
    println!("Initializing project");

    std::fs::create_dir_all(folder_path).map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to create project directory.")
            .from_err(e)
            .entity(PROJECT)
            .not_created()
    })?;

    let db_connection =
        setup_db(&Project::generate_connection_string(folder_path, in_memory)).await?;

    let db_config = DatabaseConfig {
        in_memory,
        connection: db_connection,
    };

    let project = Project {
        id: Uuid::new_v4().to_string(),
        name: name.to_string(),
        folder_path: folder_path.to_string(),
        database: db_config,
    };

    let id = state.add_project(project);
    let project = state.get_project(&id).unwrap();

    if !in_memory {
        _write_project_config_to_file(project)?;
        let _ = config_service::save_app_config(&state.config);
    }

    Ok(generate_response(project))
}

pub async fn load(
    state: &mut MutexGuard<'_, StateData>,
    folder_path: &Option<String>,
) -> Result<ProjectResponseSchema, Error> {
    let folder_path = match folder_path {
        Some(path) => path.to_owned(),
        None => match state.config.recent_project_paths.first() {
            Some(path) => path.to_owned(),
            None => String::new(),
        },
    };

    if folder_path.is_empty() {
        return Err(ErrorBuilder::new()
            .msg("Folder path is required to load a project.")
            .entity(PROJECT)
            .not_found());
    }

    let id = match state.get_project_id_of_path(&folder_path) {
        Some(id) => id,
        None => {
            let config_file = _read_project_config_from_file(&folder_path)?;

            let connection_string = Project::generate_connection_string(&folder_path, false);
            let db_connection = setup_db(&connection_string).await?;

            let project = Project {
                id: Uuid::new_v4().to_string(),
                name: config_file.name,
                folder_path: folder_path.to_string(),
                database: DatabaseConfig {
                    in_memory: false,
                    connection: db_connection,
                },
            };

            state.add_project(project)
        }
    };

    state.config.add_recent_project(&folder_path);
    let _ = config_service::save_app_config(&state.config);

    let project = state.get_project(&id).unwrap();
    Ok(generate_response(project))
}

pub async fn close(state: &mut MutexGuard<'_, StateData>, id: &str) -> Result<(), Error> {
    let project = match state.remove_project(id) {
        Some(project) => project,
        None => {
            return Err(ErrorBuilder::new()
                .msg("Project not found.")
                .entity(PROJECT)
                .with_id(&id)
                .not_found());
        }
    };

    project
        .database
        .connection
        .close()
        .await
        .map_err(|e| Error::DatabaseConnectionFailed {
            msg: "Failed to close database connection".to_string(),
            error: e.to_string(),
        })?;

    Ok(())
}

pub async fn update(
    state: &mut MutexGuard<'_, StateData>,
    id: &str,
    name: &str,
) -> Result<ProjectResponseSchema, Error> {
    let project = match state.get_project_mut(id) {
        Some(project) => project,
        None => {
            return Err(ErrorBuilder::new()
                .msg("Project not found.")
                .entity(PROJECT)
                .with_id(&id)
                .not_found());
        }
    };

    project.name = name.to_string();

    _write_project_config_to_file(project)?;

    Ok(generate_response(project))
}

pub fn get_database<'a>(
    state: &'a MutexGuard<'_, StateData>,
    project_id: &str,
) -> Result<&'a DatabaseConnection, Error> {
    match state.get_project(project_id) {
        Some(project) => Ok(&project.database.connection),
        None => Err(ErrorBuilder::new()
            .msg("Project not found.")
            .entity(PROJECT)
            .with_id(&project_id)
            .not_found()),
    }
}

fn _read_project_config_from_file(folder_path: &str) -> Result<ProjectConfigFileSchema, Error> {
    let config_file_path = format!("{folder_path}/{PROJECT_CONFIG_FILE_NAME}");

    let exists = fs::metadata(&config_file_path).is_ok();

    if !exists {
        return Ok(ProjectConfigFileSchema {
            name: "New project".to_string(),
        });
    }

    let config_text = match fs::read_to_string(&config_file_path) {
        Ok(val) => val,
        Err(e) => {
            return Err(Error::FileSystemOperationFailed {
                msg: "Failed to read project config file".to_string(),
                error: e.to_string(),
            });
        }
    };

    match serde_json::from_str(&config_text) {
        Ok(val) => Ok(val),
        Err(e) => Err(Error::ConfigDeserializationFailed {
            msg: "Failed to deserialize project config file".to_string(),
            error: e.to_string(),
        }),
    }
}

fn _write_project_config_to_file(project: &Project) -> Result<(), Error> {
    let config = ProjectConfigFileSchema {
        name: project.name.clone(),
    };

    let config_text = match serde_json::to_string(&config) {
        Ok(val) => val,
        Err(e) => {
            return Err(Error::ConfigSerializationFailed {
                msg: "Failed to serialize project config".to_string(),
                error: e.to_string(),
            });
        }
    };

    let config_file_path = format!("{}/{}", project.folder_path, PROJECT_CONFIG_FILE_NAME);
    match fs::write(&config_file_path, &config_text) {
        Ok(_) => Ok(()),
        Err(e) => Err(Error::FileSystemOperationFailed {
            msg: "Failed to write project config to file".to_string(),
            error: e.to_string(),
        }),
    }
}

pub fn generate_response(project: &Project) -> ProjectResponseSchema {
    ProjectResponseSchema {
        id: project.id.clone(),
        name: project.name.to_string(),
    }
}

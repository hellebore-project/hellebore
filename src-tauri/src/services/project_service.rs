use sea_orm::DatabaseConnection;
use tokio::sync::MutexGuard;

use ::entity::project::Model as Project;

use crate::database::{project_manager, setup};
use crate::model::errors::{Error, ErrorBuilder};
use crate::schema::project::{ProjectLoadResponseSchema, ProjectResponseSchema};
use crate::state::StateData;
use crate::types::entity::PROJECT;

pub async fn create(
    state: &mut MutexGuard<'_, StateData>,
    name: &str,
    folder_path: &str,
) -> Result<ProjectLoadResponseSchema, Error> {
    println!("Initializing project");

    std::fs::create_dir_all(folder_path).map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to create project directory.")
            .from_err(e)
            .entity(PROJECT)
            .not_created()
    })?;

    state.settings.folder_path = Some(folder_path.to_string());
    state.settings.write_config_file();

    let db = setup::setup(&state.settings).await?;

    let mut projects = get_all(&db).await?;

    let project: ProjectResponseSchema;
    if projects.is_empty() {
        println!("No project found; creating new project '{name}'");
        project = match project_manager::insert(&db, &name).await {
            Ok(entity) => generate_response(&entity),
            Err(e) => {
                return Err(ErrorBuilder::new()
                    .msg("Project not created.")
                    .from_err(e)
                    .entity(PROJECT)
                    .not_created());
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
    folder_path: &str,
) -> Result<ProjectLoadResponseSchema, Error> {
    state.settings.folder_path = Some(folder_path.to_string());
    state.settings.write_config_file();

    let db = setup::setup(&state.settings).await?;
    let project = match get(&db).await? {
        Some(project) => project,
        None => {
            return Err(ErrorBuilder::new()
                .msg("Project not found.")
                .entity(PROJECT)
                .not_found());
        }
    };
    Ok(ProjectLoadResponseSchema { info: project, db })
}

pub async fn close(state: &mut MutexGuard<'_, StateData>) -> Result<(), Error> {
    state.settings.folder_path = None;
    state.settings.write_config_file();
    state.database = None;
    Ok(())
}

pub async fn update(
    database: &DatabaseConnection,
    name: &str,
) -> Result<ProjectResponseSchema, Error> {
    let project = match get(&database).await? {
        Some(project) => project,
        None => {
            return Err(ErrorBuilder::new()
                .msg("Project not found.")
                .entity(PROJECT)
                .not_found());
        }
    };
    return match project_manager::update(database, project.id, &name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ErrorBuilder::new()
            .msg("Project not updated.")
            .from_err(e)
            .entity(PROJECT)
            .with_id(project.id)
            .not_updated()),
    };
}

pub async fn get(database: &DatabaseConnection) -> Result<Option<ProjectResponseSchema>, Error> {
    let mut projects = get_all(&database).await?;
    if projects.is_empty() {
        return Ok(None);
    }

    let project = projects.remove(0);
    Ok(Some(project))
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<ProjectResponseSchema>, Error> {
    let projects = project_manager::get_all(database).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query project table while fetching all projects.")
            .from_err(e)
            .db()
            .query_failed()
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

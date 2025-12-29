use sea_orm::DatabaseConnection;
use tokio::sync::MutexGuard;

use crate::{model::errors::api_error::ApiError, state::StateData};

pub fn get_database<'a>(
    state: &'a MutexGuard<'_, StateData>,
) -> Result<&'a DatabaseConnection, ApiError> {
    match state.database.as_ref() {
        Some(database) => Ok(database),
        None => Err(ApiError::ProjectNotLoaded),
    }
}

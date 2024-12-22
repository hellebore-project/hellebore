use sea_orm::{Database, DatabaseConnection};

use migration::{Migrator, MigratorTrait};

use crate::{errors::ApiError, settings::Settings};

pub async fn setup(settings: &Settings) -> Result<DatabaseConnection, ApiError> {
    // connect to the DB
    let conn_str = &settings.database.connection_string;
    let db = Database::connect(conn_str)
        .await
        .map_err(|e| ApiError::db_connection_failed(e, conn_str.to_string()))?;

    // migrate the DB
    Migrator::up(&db, None)
        .await
        .map_err(|e| ApiError::db_migration_failed(e, conn_str.to_string()))?;

    Ok(db)
}

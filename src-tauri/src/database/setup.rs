use sea_orm::{Database, DatabaseConnection};

use migration::{Migrator, MigratorTrait};

use crate::{
    model::errors::{Error, ErrorBuilder},
    settings::Settings,
};

pub async fn setup(settings: &Settings) -> Result<DatabaseConnection, Error> {
    // connect to the DB
    let conn_str = match settings.get_connection_string() {
        Some(conn_str) => conn_str,
        None => return Err(Error::ProjectNotLoaded),
    };
    let db = Database::connect(&conn_str).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to connect to the DB.")
            .from_err(e)
            .db()
            .connection_failed()
    })?;

    // migrate the DB
    Migrator::up(&db, None).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("DB migrations failed.")
            .from_err(e)
            .db()
            .migration_failed()
    })?;

    Ok(db)
}

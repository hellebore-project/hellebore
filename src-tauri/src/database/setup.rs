use sea_orm::{Database, DatabaseConnection};

use migration::{Migrator, MigratorTrait};

use crate::model::errors::{Error, ErrorBuilder};

pub async fn setup_db(connection_string: &str) -> Result<DatabaseConnection, Error> {
    let db = Database::connect(connection_string).await.map_err(|e| {
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

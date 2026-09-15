use log::LevelFilter;
use sea_orm::{ConnectOptions, Database, DatabaseConnection};

use migration::{Migrator, MigratorTrait};

use crate::model::errors::{Error, ErrorBuilder};

pub async fn setup_db(connection_string: &str) -> Result<DatabaseConnection, Error> {
    let mut options = ConnectOptions::new(connection_string);
    options.sqlx_logging_level(LevelFilter::Debug);

    let db = Database::connect(options).await.map_err(|e| {
        ErrorBuilder::new()
            .msg(&format!(
                "Failed to connect to the DB at {}.",
                connection_string
            ))
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

use sea_orm::{Database, DatabaseConnection};

use migration::{Migrator, MigratorTrait};

use crate::settings::Settings;

pub async fn setup(settings: &Settings) -> DatabaseConnection {
    // connect to the DB
    let conn_str = &settings.database.connection_string;
    let db = Database::connect(conn_str).await.expect(&format!(
        "Failed to connect to the sqlite database at {conn_str}."
    ));

    // migrate the DB
    Migrator::up(&db, None).await.expect(&format!(
        "Failed to migrate the sqlite database at {conn_str}."
    ));

    db
}

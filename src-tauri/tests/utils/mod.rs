use fantasy_log_app::{app, settings};

pub async fn setup() -> app::AppState {
    let settings = settings::Settings {
        data_dir_path: String::from(""),
        database: settings::DatabaseSettings {
            db_file_path: String::from(""),
            connection_string: String::from("sqlite::memory:")
        }
    };
    return app::setup(settings).await;
}
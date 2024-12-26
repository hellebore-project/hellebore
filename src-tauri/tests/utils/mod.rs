use hellebore::{app, settings, state::State};

pub async fn setup() -> State {
    let settings = settings::Settings {
        data_dir_path: String::from(""),
        database: settings::DatabaseSettings {
            file_path: Some(String::from("")),
            in_memory: true,
        },
    };
    return app::setup(settings).await.unwrap();
}

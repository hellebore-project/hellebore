use tauri::{Builder, Runtime, Wry};
use tauri_plugin_log::{Target, TargetKind};

use crate::api;
use crate::model::{config::AppConfig, errors::Error, state::State};
use crate::services::{config_service, project_service};

// NOTE: log messages don't show up in the terminal during startup,
// so use println to log messages instead

pub async fn start_app() {
    println!("Building app");

    let config = match config_service::load_app_config() {
        Ok(config) => {
            println!("Loaded app config");
            config
        }
        Err(e) => {
            println!("Failed to load app config: {e}");
            AppConfig::default()
        }
    };

    // TODO: handle this error more gracefully
    let state = setup_state(config).await.expect("Failed to set up app");

    let builder = create_app_builder(state).await;

    println!("Starting app");
    builder
        .run(tauri::generate_context!())
        .expect("Failed to run app");
}

pub async fn create_app_builder(state: State) -> Builder<Wry> {
    println!("Configuring app builder");

    let state_data = state.lock().await;

    let mut builder = Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(state_data.config.log_level)
                .target(Target::new(TargetKind::Webview))
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init());

    drop(state_data);

    builder = builder.manage(state);

    builder = attach_handlers(builder);

    builder
}

pub async fn setup_state(config: AppConfig) -> Result<State, Error> {
    println!("Creating app state");

    let state = State::new(config);
    let mut state_data = state.lock().await;

    println!("Loading most recent project");

    let recent_projects = state_data.config.recent_project_paths.clone();

    if let Some(path) = recent_projects.first() {
        match project_service::load(&mut state_data, &Some(path.clone())).await {
            Ok(_) => {
                println!("Loaded project at `{path}`")
            }
            Err(e) => {
                println!("Failed to load project at `{path}`: {e:?}");
            }
        }
    } else {
        println!("No recent projects found");
    }

    drop(state_data);

    Ok(state)
}

pub fn attach_handlers<R>(builder: Builder<R>) -> Builder<R>
where
    R: Runtime,
{
    println!("Attaching API handlers");

    builder.invoke_handler(tauri::generate_handler![
        // project API
        api::project::create_project,
        api::project::load_project,
        api::project::close_project,
        api::project::update_project,
        // entry API
        api::entry::create_entry,
        api::entry::update_entry,
        api::entry::update_entries,
        api::entry::validate_entry_title,
        api::entry::get_entry,
        api::entry::get_entry_properties,
        api::entry::get_entry_text,
        api::entry::list_entries,
        api::entry::delete_entry,
        // folder API
        api::folder::create_folder,
        api::folder::update_folder,
        api::folder::update_folders,
        api::folder::validate_folder_name,
        api::folder::get_folder,
        api::folder::list_folders,
        api::folder::delete_folder,
        // word API
        api::word::upsert_words,
        api::word::get_word,
        api::word::list_words,
        api::word::delete_word,
    ])
}

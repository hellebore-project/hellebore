// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use hellebore::{app, model::config::AppConfig, services::config_service};

#[tokio::main]
async fn main() {
    println!("Building app");

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init());

    let config = AppConfig::default();
    match config_service::write_app_config_to_file(&config) {
        Ok(_) => (),
        Err(e) => {
            println!("Failed to write app config file: {e}");
        }
    }

    println!("Initializing app state");
    // TODO: fall back to an error state in the UI if setup fails
    let state = app::setup(config).await.expect("Failed to set up app");
    builder = builder.manage(state);

    println!("Attaching API handlers");
    builder = app::attach_handlers(builder);

    println!("Running app");
    builder
        .run(tauri::generate_context!())
        .expect("Failed to run app");
}

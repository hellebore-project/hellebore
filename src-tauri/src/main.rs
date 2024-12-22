// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri;

use hellebore::{app, settings::get_settings};

#[tokio::main]
async fn main() {
    let mut builder = tauri::Builder::default().plugin(tauri_plugin_shell::init());

    let settings = get_settings();
    // TODO: handle error
    let state = app::setup(settings)
        .await
        .expect("Failed to set up application.");
    builder = builder.manage(state);

    builder = app::attach_handlers(builder);

    builder
        .run(tauri::generate_context!())
        .expect("Failed to run application.");
}

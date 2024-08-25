// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri;

use hellebore::{app, settings::get_settings};

#[tokio::main]
async fn main() {
    let settings = get_settings();
    let state = app::setup(settings).await;
    let mut builder = tauri::Builder::default();
    builder = builder.manage(state);
    builder = app::attach_handlers(builder);
    builder
        .run(tauri::generate_context!())
        .expect("The tauri application failed to run.");
}

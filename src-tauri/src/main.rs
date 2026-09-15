// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use hellebore::app;

#[tokio::main]
async fn main() {
    log::info!("Running app");
    app::start_app().await;
}

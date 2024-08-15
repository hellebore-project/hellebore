// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri;

use fantasy_log_app::{api, app, settings::get_settings};

#[tokio::main]
async fn main() {
    let settings = get_settings();
    let state = app::setup(settings).await;
    let mut builder = tauri::Builder::default();
    builder = builder.manage(state);
    builder = attach_handlers(builder);
    builder
        .run(tauri::generate_context!())
        .expect("The tauri application failed to run.");
}

fn attach_handlers<R>(builder: tauri::Builder<R>) -> tauri::Builder<R> where R: tauri::Runtime {
    builder.invoke_handler(
        tauri::generate_handler![

            // article API
            api::article::get_articles,

            // language API
            api::language::create_language,
            api::language::update_language,
            api::language::get_language,
            api::language::delete_language,

        ]
    )
}

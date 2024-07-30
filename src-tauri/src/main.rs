// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod app;
mod settings;
mod api;
mod schema;
mod services;

#[tokio::main]
async fn main() {
    let state = app::build_app().await;
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

            // language API
            api::language::create_language,
            api::language::update_language,
            api::language::get_language,
            api::language::get_languages,
            api::language::delete_language,

        ]
    )
}

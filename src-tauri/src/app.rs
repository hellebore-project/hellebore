use crate::api;
use crate::model::{config::AppConfig, errors::Error, state::State};
use crate::services::project_service;

pub async fn setup(config: AppConfig) -> Result<State, Error> {
    println!("Setting up backend");

    let state = State::new(config);
    let mut state_data = state.lock().await;

    let recent_projects = state_data.config.recent_project_paths.clone();
    for path in recent_projects {
        match project_service::load(&mut state_data, &Some(path.clone())).await {
            Ok(_) => {}
            Err(e) => {
                println!("Failed to restore project at '{path}': {e:?}");
            }
        }
    }

    drop(state_data);

    Ok(state)
}

pub fn attach_handlers<R>(builder: tauri::Builder<R>) -> tauri::Builder<R>
where
    R: tauri::Runtime,
{
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
        api::entry::get_entries,
        api::entry::get_entry_properties,
        api::entry::get_entry_text,
        api::entry::search_entries,
        api::entry::delete_entry,
        // folder API
        api::folder::create_folder,
        api::folder::update_folder,
        api::folder::update_folders,
        api::folder::validate_folder_name,
        api::folder::get_folder,
        api::folder::get_folders,
        api::folder::delete_folder,
        // word API
        api::word::upsert_words,
        api::word::get_word,
        api::word::get_words,
        api::word::delete_word,
    ])
}

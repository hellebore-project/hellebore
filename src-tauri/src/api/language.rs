use entity::language::Model;

use crate::app::AppState;
use crate::schema::language::{Language, IdentifiedLanguage};
use crate::services::language as language_manager;

#[tauri::command]
pub async fn create_language(state: tauri::State<'_, AppState>, language: Language) -> Result<IdentifiedLanguage, String> {
    let result = language_manager::insert_language(&state.database, &language.name).await;
    let language = match result {
        Ok(v) => v,
        Err(_e) => return Err(String::from("Failed to create a new language.")),
    };
    let response = generate_response(language);
    Ok(response)
}

#[tauri::command]
pub async fn update_language(state: tauri::State<'_, AppState>, language: IdentifiedLanguage) -> Result<IdentifiedLanguage, String> {
    let result = language_manager::update_language(&state.database, language.id, &language.data.name).await;
    let language = match result {
        Ok(v) => v,
        Err(_e) => return Err(String::from("Failed to update language.")),
    };
    let response = generate_response(language);
    Ok(response)
}

#[tauri::command]
pub async fn get_language(state: tauri::State<'_, AppState>, id: i32) -> Result<IdentifiedLanguage, String> {
    let result = language_manager::get_language(&state.database, id).await;
    let language = match result {
        Ok(v) => v,
        Err(_e) => return Err(String::from("Failed to fetch requested language.")),
    };
    let language = match language {
        Some(v) => v,
        None => return Err(String::from("Language not found.")),
    };
    let response = generate_response(language);
    Ok(response)
}

#[tauri::command]
pub async fn get_languages(state: tauri::State<'_, AppState>) -> Result<Vec<IdentifiedLanguage>, String> {
    let result = language_manager::get_languages(&state.database).await;
    let languages = match result {
        Ok(v) => v,
        Err(_e) => return Err(String::from("Failed to fetch languages.")),
    };
    let response = languages
        .into_iter()
        .map(|el| generate_response(el))
        .collect();
    Ok(response)
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, AppState>, id: i32) -> Result<i32, String> {
    let result = language_manager::delete_language(&state.database, id).await;
    let delete_result = match result {
        Ok(v) => v,
        Err(_e) => return Err(String::from("Failed to delete language.")),
    };
    if delete_result.rows_affected == 0 {
        return Err(String::from("Language not found."))
    }
    Ok(id)
}

fn generate_response(language: Model) -> IdentifiedLanguage {
    IdentifiedLanguage {
        id: language.id,
        data: Language {
            name: language.name,
        }
    }
}
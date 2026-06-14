use std::{
    env, fs,
    sync::{Mutex, MutexGuard, OnceLock},
};

use hellebore::{
    constants::{APP_CONFIG_FILE_NAME, DATA_DIR_NAME},
    model::errors::Error,
    services::config_service,
};
use rstest::*;

use crate::fixtures::config::{TempConfigDir, app_config, app_config_file_schema, temp_config_dir};

fn env_lock() -> MutexGuard<'static, ()> {
    static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
    LOCK.get_or_init(|| Mutex::new(())).lock().unwrap()
}

fn set_env(key: &str, value: &str) {
    unsafe { env::set_var(key, value) }
}

fn remove_env(key: &str) {
    unsafe { env::remove_var(key) }
}

#[rstest]
fn test_get_user_data_dir_path_uses_hellebore_data_dir(temp_config_dir: TempConfigDir) {
    let _guard = env_lock();
    set_env("HELLEBORE_DATA_DIR", temp_config_dir.path());
    remove_env("HOME");

    let result = config_service::get_user_data_dir_path();

    assert!(result.is_ok());
    assert_eq!(result.unwrap(), temp_config_dir.path());
    assert!(fs::metadata(temp_config_dir.path()).is_ok());

    remove_env("HELLEBORE_DATA_DIR");
}

#[rstest]
fn test_get_user_data_dir_path_falls_back_to_home(temp_config_dir: TempConfigDir) {
    let _guard = env_lock();
    remove_env("HELLEBORE_DATA_DIR");
    set_env("HOME", temp_config_dir.path());

    let result = config_service::get_user_data_dir_path();
    let expected = format!("{}/{}", temp_config_dir.path(), DATA_DIR_NAME);

    assert!(result.is_ok());
    assert_eq!(result.unwrap(), expected);
    assert!(fs::metadata(expected).is_ok());

    remove_env("HOME");
}

#[rstest]
fn test_get_user_data_dir_path_returns_error_for_file_path(temp_config_dir: TempConfigDir) {
    let _guard = env_lock();
    let file_path = format!("{}/config-file", temp_config_dir.path());
    fs::write(&file_path, "not a directory").unwrap();

    set_env("HELLEBORE_DATA_DIR", &file_path);
    remove_env("HOME");

    let result = config_service::get_user_data_dir_path();

    assert!(result.is_err());
    match result.unwrap_err() {
        Error::FileSystemOperationFailed { msg, .. } => {
            assert_eq!(msg, "Failed to create user data directory");
        }
        err => panic!("Unexpected error: {err:?}"),
    }

    remove_env("HELLEBORE_DATA_DIR");
}

#[rstest]
fn test_get_user_config_file_path(temp_config_dir: TempConfigDir) {
    let _guard = env_lock();
    set_env("HELLEBORE_DATA_DIR", temp_config_dir.path());
    remove_env("HOME");

    let result = config_service::get_user_config_file_path();
    let expected = format!("{}/{}", temp_config_dir.path(), APP_CONFIG_FILE_NAME);

    assert!(result.is_ok());
    assert_eq!(result.unwrap(), expected);

    remove_env("HELLEBORE_DATA_DIR");
}

#[rstest]
fn test_load_app_config_returns_default_when_config_file_missing(temp_config_dir: TempConfigDir) {
    let _guard = env_lock();
    set_env("HELLEBORE_DATA_DIR", temp_config_dir.path());
    remove_env("HOME");

    let result = config_service::load_app_config();

    assert!(result.is_ok());
    assert!(result.unwrap().recent_project_paths.is_empty());

    remove_env("HELLEBORE_DATA_DIR");
}

#[rstest]
fn test_load_app_config_reads_config_file(
    temp_config_dir: TempConfigDir,
    app_config_file_schema: hellebore::schema::config::AppConfigFileSchema,
) {
    let _guard = env_lock();
    set_env("HELLEBORE_DATA_DIR", temp_config_dir.path());
    remove_env("HOME");

    let config_file_path = format!("{}/{}", temp_config_dir.path(), APP_CONFIG_FILE_NAME);
    fs::write(
        &config_file_path,
        serde_json::to_string(&app_config_file_schema).unwrap(),
    )
    .unwrap();

    let result = config_service::load_app_config();

    assert!(result.is_ok());
    assert_eq!(
        result.unwrap().recent_project_paths,
        app_config_file_schema.recent_projects
    );

    remove_env("HELLEBORE_DATA_DIR");
}

#[rstest]
fn test_load_app_config_returns_default_when_file_is_invalid_json(temp_config_dir: TempConfigDir) {
    let _guard = env_lock();
    set_env("HELLEBORE_DATA_DIR", temp_config_dir.path());
    remove_env("HOME");

    let config_file_path = format!("{}/{}", temp_config_dir.path(), APP_CONFIG_FILE_NAME);
    fs::write(&config_file_path, "{ this is invalid json }").unwrap();

    let result = config_service::load_app_config();

    assert!(result.is_ok());
    assert!(result.unwrap().recent_project_paths.is_empty());

    remove_env("HELLEBORE_DATA_DIR");
}

#[rstest]
fn test_save_app_config_writes_config_file(
    temp_config_dir: TempConfigDir,
    app_config: hellebore::model::config::AppConfig,
) {
    let _guard = env_lock();
    set_env("HELLEBORE_DATA_DIR", temp_config_dir.path());
    remove_env("HOME");

    let result = config_service::save_app_config(&app_config);

    assert!(result.is_ok());

    let config_file_path = format!("{}/{}", temp_config_dir.path(), APP_CONFIG_FILE_NAME);
    let config_text = fs::read_to_string(config_file_path);
    assert!(config_text.is_ok());

    let file = serde_json::from_str::<hellebore::schema::config::AppConfigFileSchema>(
        &config_text.unwrap(),
    );
    assert!(file.is_ok());
    assert_eq!(
        file.unwrap().recent_projects,
        app_config.recent_project_paths
    );

    remove_env("HELLEBORE_DATA_DIR");
}

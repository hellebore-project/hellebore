use log::LevelFilter;
use serde_json::json;

use hellebore::schema::config::AppConfigFileSchema;

#[test]
fn test_default_app_config_file_schema() {
    let config = AppConfigFileSchema::default();

    assert!(config.recent_projects.is_empty());
    assert_eq!(config.log_level, LevelFilter::Info);
}

#[test]
fn test_deserializing_app_config_file_schema_defaults_optional_fields() {
    let config = serde_json::from_value::<AppConfigFileSchema>(json!({})).unwrap();

    assert!(config.recent_projects.is_empty());
    assert_eq!(config.log_level, LevelFilter::Info);
}

#[test]
fn test_app_config_file_schema_round_trips_through_json() {
    let expected = AppConfigFileSchema {
        recent_projects: vec![
            "/tmp/hellebore-project-a".to_string(),
            "/tmp/hellebore-project-b".to_string(),
        ],
        log_level: LevelFilter::Warn,
    };

    let serialized = serde_json::to_string(&expected).unwrap();
    let config = serde_json::from_str::<AppConfigFileSchema>(&serialized).unwrap();

    assert_eq!(config.recent_projects, expected.recent_projects);
    assert_eq!(config.log_level, expected.log_level);
}

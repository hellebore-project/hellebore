use std::env;
use std::fs;

use rstest::*;
use uuid::Uuid;

pub struct TempProjectDir {
    path: String,
}

impl TempProjectDir {
    pub fn path(&self) -> &str {
        &self.path
    }
}

impl Drop for TempProjectDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

#[fixture]
pub fn project_name() -> String {
    "My Project".to_string()
}

#[fixture]
pub fn updated_project_name() -> String {
    "Updated Project".to_string()
}

#[fixture]
pub fn missing_project_id() -> Uuid {
    Uuid::new_v4()
}

#[fixture]
pub fn temp_project_dir() -> TempProjectDir {
    let path = env::temp_dir().join(format!("hellebore-project-tests-{}", Uuid::new_v4()));
    fs::create_dir_all(&path).unwrap();

    TempProjectDir {
        path: path.to_string_lossy().to_string(),
    }
}

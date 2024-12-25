#[derive(serde::Serialize, serde::Deserialize)]
pub struct SessionSchema {
    pub db_file_path: Option<String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ConfigSchema {
    pub session: SessionSchema,
}

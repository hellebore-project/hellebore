/*
These schemas are only meant to be used for the config file that's read from disk.
They are not intended to be used by the API.
*/

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SessionSchema {
    pub db_file_path: Option<String>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ConfigSchema {
    pub session: SessionSchema,
}

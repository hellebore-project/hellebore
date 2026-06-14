use serde::{Deserialize, Serialize};

use crate::types::entity::EntityType;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum Error {
    // CONFIG ERRORS
    ConfigSerializationFailed {
        msg: String,
        error: String,
    },
    ConfigDeserializationFailed {
        msg: String,
        error: String,
    },

    // PROJECT ERRORS
    ProjectNotLoaded,

    // ENTITY ERRORS
    NotCreated {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
    },
    NotUpdated {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
        id: String,
    },
    NotFound {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
        id: String,
    },
    NotDeleted {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
        id: String,
    },

    // ATTRIBUTE ERRORS
    AttributeNotUpdated {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
        id: String,
        key: String,
    },
    AttributeNotUnique {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
        id: Option<String>,
        key: String,
        value: String,
    },
    AttributeInvalid {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
        id: Option<String>,
        key: String,
        value: String,
    },

    // ENTRY ERRORS
    UnsupportedEntryType {
        msg: String,
        error: Option<String>,
        entity_type: EntityType,
    },
    EntryTextDeserializationFailed {
        msg: String,
        error: String,
        id: String,
    },
    MissingEntryTextAttr {
        msg: String,
        key: String,
        id: String,
    },
    BadEntryReferenceId {
        msg: String,
        id: String,
        reference_id: i32,
    },
    BadEntryTextValueType {
        msg: String,
        id: String,
        key: String,
        value: String,
        expected_type: String,
    },

    // DATABASE ERRORS
    DatabaseConnectionFailed {
        msg: String,
        error: String,
    },
    DatabaseMigrationFailed {
        msg: String,
        error: String,
    },
    DatabaseTransactionFailed {
        msg: String,
        error: String,
    },
    DatabaseQueryFailed {
        msg: String,
        error: String,
    },

    // FILE SYSTEM ERRORS
    FileSystemOperationFailed {
        msg: String,
        error: String,
    },
}

fn create_formatted_error_string(
    error_code: &str,
    identifier: &impl ToString,
    msg: &str,
    error: &Option<String>,
) -> String {
    format!(
        "[{}] {{{}}} {:?} {:?}",
        error_code,
        identifier.to_string(),
        msg,
        error,
    )
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let formatted_string = match self {
            Error::ConfigDeserializationFailed { msg, error } => create_formatted_error_string(
                "CONFIG_DESERIALIZATION_FAILED",
                &"",
                msg,
                &Some(error.to_owned()),
            ),
            Error::ConfigSerializationFailed { msg, error } => create_formatted_error_string(
                "CONFIG_SERIALIZATION_FAILED",
                &"",
                msg,
                &Some(error.to_owned()),
            ),

            Error::ProjectNotLoaded => "Project not loaded".to_owned(),

            Error::NotCreated {
                msg,
                entity_type,
                error,
            } => create_formatted_error_string("NOT_INSERTED", entity_type, msg, error),

            Error::NotUpdated {
                msg,
                error,
                entity_type,
                id,
            } => create_formatted_error_string(
                "NOT_UPDATED",
                &format!("{} {}", entity_type, id),
                msg,
                error,
            ),

            Error::NotFound {
                msg,
                error,
                entity_type,
                id,
            } => create_formatted_error_string(
                "NOT_FOUND",
                &format!("{} {}", entity_type, id),
                msg,
                error,
            ),

            Error::NotDeleted {
                msg,
                error,
                entity_type,
                id,
            } => create_formatted_error_string(
                "NOT_DELETED",
                &format!("{} {}", entity_type, id),
                msg,
                error,
            ),

            Error::AttributeNotUpdated {
                msg,
                error,
                entity_type,
                id,
                key,
            } => create_formatted_error_string(
                "FIELD_NOT_UPDATED",
                &format!("{} {} {}", entity_type, id, key),
                msg,
                error,
            ),

            Error::AttributeNotUnique {
                msg,
                entity_type,
                id,
                key,
                value,
                error,
            } => create_formatted_error_string(
                "FIELD_NOT_UNIQUE",
                &format!("{} {:?} {} {}", entity_type, id, key, value,),
                msg,
                error,
            ),

            Error::AttributeInvalid {
                msg,
                entity_type,
                id,
                key,
                value,
                error,
            } => create_formatted_error_string(
                "FIELD_INVALID",
                &format!("{} {:?} {} {}", entity_type, id, key, value),
                msg,
                error,
            ),

            Error::UnsupportedEntryType {
                msg,
                error,
                entity_type,
            } => create_formatted_error_string("UNSUPPORTED_ENTRY_TYPE", entity_type, msg, error),

            Error::EntryTextDeserializationFailed { msg, error, id } => {
                create_formatted_error_string(
                    "DESERIALIZATION_FAILED",
                    id,
                    msg,
                    &Some(error.to_owned()),
                )
            }

            Error::MissingEntryTextAttr { msg, id, key } => create_formatted_error_string(
                "MISSING_ATTR",
                &format!("{} {}", id, key),
                msg,
                &None,
            ),

            Error::BadEntryReferenceId {
                msg,
                id,
                reference_id,
            } => create_formatted_error_string(
                "BAD_REFERENCE_ID",
                &format!("{} {}", id, reference_id),
                msg,
                &None,
            ),

            Error::BadEntryTextValueType {
                msg,
                id,
                key,
                value,
                expected_type,
            } => create_formatted_error_string(
                "BAD_VALUE_TYPE",
                &format!("{} {} {}", id, key, value),
                msg,
                &Some(format!("Expected type: {}", expected_type)),
            ),

            Error::DatabaseConnectionFailed { msg, error } => create_formatted_error_string(
                "DB_CONNECTION_FAILED",
                &"",
                msg,
                &Some(error.to_owned()),
            ),

            Error::DatabaseMigrationFailed { msg, error } => create_formatted_error_string(
                "DB_MIGRATION_FAILED",
                &"",
                msg,
                &Some(error.to_owned()),
            ),

            Error::DatabaseTransactionFailed { msg, error } => create_formatted_error_string(
                "DB_TRANSACTION_FAILED",
                &"",
                msg,
                &Some(error.to_owned()),
            ),

            Error::DatabaseQueryFailed { msg, error } => {
                create_formatted_error_string("DB_QUERY_FAILED", &"", msg, &Some(error.to_owned()))
            }

            Error::FileSystemOperationFailed { msg, error } => create_formatted_error_string(
                "FILESYSTEM_OPERATION_FAILED",
                &"",
                msg,
                &Some(error.to_owned()),
            ),
        };

        write!(f, "{}", formatted_string)
    }
}

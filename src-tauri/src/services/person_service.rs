use sea_orm::DatabaseConnection;

use ::entity::person::Model as Person;

use crate::database::person_manager;
use crate::errors::ApiError;
use crate::schema::entry::{EntryDataResponseSchema, EntryUpdateSchema};
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoSchema},
    person::PersonDataSchema,
};
use crate::services::entry_service;
use crate::types::PERSON;

pub async fn create(
    database: &DatabaseConnection,
    entity: EntryCreateSchema<PersonDataSchema>,
) -> Result<EntryInfoSchema, ApiError> {
    let entry = entry_service::create(database, PERSON, entity.folder_id, entity.title).await?;

    person_manager::insert(&database, entry.id, &entity.data.name)
        .await
        .map_err(|e| ApiError::not_inserted(e, PERSON))?;

    Ok(entry_service::generate_insert_response(&entry))
}

pub async fn update(
    database: &DatabaseConnection,
    entity: EntryUpdateSchema<PersonDataSchema>,
) -> Result<(), ApiError> {
    person_manager::update(database, entity.id, &entity.data.name)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_updated(e, PERSON))
}

pub async fn get(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryDataResponseSchema<PersonDataSchema>, ApiError> {
    let entity = person_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, PERSON))?;
    return match entity {
        Some(entity) => Ok(generate_response(entity)),
        None => Err(ApiError::not_found("Person not found.", PERSON)),
    };
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    entry_service::delete(&database, id).await?;
    return Ok(());
}

fn generate_response(entity: Person) -> EntryDataResponseSchema<PersonDataSchema> {
    EntryDataResponseSchema {
        id: entity.id,
        data: PersonDataSchema { name: entity.name },
    }
}

use sea_orm::DatabaseConnection;

use ::entity::person::Model as Person;

use crate::database::person_manager;
use crate::errors::ApiError;
use crate::schema::entry::EntryUpdateSchema;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoResponseSchema},
    person::PersonSchema,
};
use crate::services::entry_service;
use crate::types::entity::PERSON;

pub async fn create(
    database: &DatabaseConnection,
    entity: EntryCreateSchema<PersonSchema>,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let entry = entry_service::create(database, PERSON, entity.folder_id, entity.title).await?;

    person_manager::insert(&database, entry.id, &entity.properties.name)
        .await
        .map_err(|e| ApiError::not_inserted(e, PERSON))?;

    Ok(entry_service::generate_insert_response(&entry))
}

pub async fn update(
    database: &DatabaseConnection,
    entity: EntryUpdateSchema<PersonSchema>,
) -> Result<(), ApiError> {
    person_manager::update(database, entity.id, &entity.properties.name)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_updated(e, PERSON))
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<PersonSchema, ApiError> {
    let person = person_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, PERSON))?;
    return match person {
        Some(person) => Ok(generate_response(person)),
        None => Err(ApiError::not_found("Person not found.", PERSON)),
    };
}

fn generate_response(person: Person) -> PersonSchema {
    PersonSchema { name: person.name }
}

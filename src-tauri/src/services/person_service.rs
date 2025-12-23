use sea_orm::{ConnectionTrait, DatabaseConnection};

use ::entity::person::Model as Person;

use crate::database::person_manager;
use crate::errors::ApiError;
use crate::schema::person::PersonSchema;
use crate::types::entity::PERSON;

pub async fn create<C>(con: &C, entry_id: i32, properties: &PersonSchema) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    person_manager::insert(con, entry_id, &properties.name)
        .await
        .map_err(|e| ApiError::not_inserted(e, PERSON))?;
    Ok(())
}

pub async fn update<C>(con: &C, id: i32, properties: &PersonSchema) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    person_manager::update(con, id, &properties.name)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_updated(e, PERSON))
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<PersonSchema, ApiError> {
    let person = person_manager::get(database, id)
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

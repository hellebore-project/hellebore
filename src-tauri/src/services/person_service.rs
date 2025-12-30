use sea_orm::{ConnectionTrait, DatabaseConnection};

use ::entity::person::Model as Person;

use crate::database::person_manager;
use crate::model::errors::api_error::ApiError;
use crate::schema::person::PersonSchema;
use crate::types::entity::PERSON;

pub async fn create<C>(con: &C, entry_id: i32, properties: &PersonSchema) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    person_manager::insert(con, entry_id, &properties.name)
        .await
        .map_err(|e| ApiError::not_created("", PERSON).from_error(e))?;
    Ok(())
}

pub async fn update<C>(con: &C, id: i32, properties: &PersonSchema) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    person_manager::update(con, id, &properties.name)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_updated("Person not updated", PERSON).from_error(e))
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<PersonSchema, ApiError> {
    let person = person_manager::get(database, id).await.map_err(|e| {
        ApiError::db(
            "Failed to query the person table while fetching a person by ID",
            e,
        )
    })?;
    return match person {
        Some(person) => Ok(generate_response(person)),
        None => Err(ApiError::not_found("Person not found", PERSON)),
    };
}

fn generate_response(person: Person) -> PersonSchema {
    PersonSchema { name: person.name }
}

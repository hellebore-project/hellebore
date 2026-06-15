use sea_orm::{ConnectionTrait, DatabaseConnection};
use uuid::Uuid;

use ::entity::person::Model as Person;

use crate::database::person_manager;
use crate::model::errors::{Error, ErrorBuilder};
use crate::schema::person::PersonSchema;
use crate::types::entity::PERSON;

pub async fn create<C>(con: &C, entry_id: Uuid, properties: &PersonSchema) -> Result<(), Error>
where
    C: ConnectionTrait,
{
    person_manager::insert(con, entry_id, &properties.name)
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Person not created.")
                .from_err(e)
                .entity(PERSON)
                .not_created()
        })?;
    Ok(())
}

pub async fn update<C>(con: &C, id: Uuid, properties: &PersonSchema) -> Result<(), Error>
where
    C: ConnectionTrait,
{
    person_manager::update(con, id, &properties.name)
        .await
        .map(|_| ())
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Person not updated.")
                .from_err(e)
                .entity(PERSON)
                .with_id(&id)
                .not_updated()
        })
}

pub async fn get(database: &DatabaseConnection, id: Uuid) -> Result<PersonSchema, Error> {
    let person = person_manager::get(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query the person table while fetching a person by ID.")
            .from_err(e)
            .db()
            .query_failed()
    })?;
    match person {
        Some(person) => Ok(generate_response(person)),
        None => Err(ErrorBuilder::new()
            .msg("Person not found.")
            .entity(PERSON)
            .with_id(&id)
            .not_found()),
    }
}

fn generate_response(person: Person) -> PersonSchema {
    PersonSchema { name: person.name }
}

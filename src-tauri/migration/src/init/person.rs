use sea_orm_migration::{prelude::*, schema::*};

use crate::init::entry::Entry;

const PERSON_ENTRY_ID_FK_NAME: &str = "fk_person_entry_id";

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Person::Table)
                    .if_not_exists()
                    .col(pk_auto(Person::Id).not_null())
                    .col(integer(Person::EntryId).not_null())
                    .col(string(Person::Name).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name(PERSON_ENTRY_ID_FK_NAME)
                            .from(Person::Table, Person::EntryId)
                            .to(Entry::Table, Entry::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;
        // TODO: add cascade delete
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Person::Table).to_owned())
            .await?;
        Ok(())
    }
}

// TODO: add dedicated foreign key for the entry
#[derive(DeriveIden)]
enum Person {
    Table,
    Id,
    EntryId,
    Name,
}

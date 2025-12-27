use sea_orm_migration::{prelude::*, schema::*};

use crate::init::entry::Entry;

const PERSON_ENTRY_ID_FK_NAME: &str = "fk_person_entry_id";
const PERSON_ENTRY_ID_INDEX_NAME: &str = "index_person_entry_id";

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

        manager
            .create_index(
                Index::create()
                    .name(PERSON_ENTRY_ID_INDEX_NAME)
                    .table(Person::Table)
                    .col(Person::EntryId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(Index::drop().name(PERSON_ENTRY_ID_INDEX_NAME).to_owned())
            .await?;
        manager
            .drop_foreign_key(ForeignKey::drop().name(PERSON_ENTRY_ID_FK_NAME).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Person::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Person {
    Table,
    Id,
    EntryId,
    Name,
}

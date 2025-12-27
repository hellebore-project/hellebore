use sea_orm_migration::{prelude::*, schema::*};

use crate::init::entry::Entry;

const LANGUAGE_ENTRY_ID_FK_NAME: &str = "fk_language_entry_id";
const LANGUAGE_ENTRY_ID_INDEX_NAME: &str = "index_language_entry_id";

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Language::Table)
                    .if_not_exists()
                    .col(pk_auto(Language::Id).not_null())
                    .col(integer(Language::EntryId).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name(LANGUAGE_ENTRY_ID_FK_NAME)
                            .from(Language::Table, Language::EntryId)
                            .to(Entry::Table, Entry::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name(LANGUAGE_ENTRY_ID_INDEX_NAME)
                    .table(Language::Table)
                    .col(Language::EntryId)
                    .unique()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(Index::drop().name(LANGUAGE_ENTRY_ID_INDEX_NAME).to_owned())
            .await?;
        manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name(LANGUAGE_ENTRY_ID_FK_NAME)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(Language::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
pub enum Language {
    Table,
    Id,
    EntryId,
}

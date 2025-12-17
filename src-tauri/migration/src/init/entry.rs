use sea_orm_migration::{prelude::*, schema::*};

use crate::init::folder::Folder;

const ENTRY_TITLE_INDEX_NAME: &str = "index_entry_title";
const ENTRY_FOLDER_ID_INDEX_NAME: &str = "index_entry_folder_id";
const ENTRY_FOLDER_ID_FK_NAME: &str = "fk_entry_folder_id";

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Entry::Table)
                    .if_not_exists()
                    .col(pk_auto(Entry::Id).not_null())
                    .col(integer_null(Entry::FolderId))
                    .col(tiny_unsigned(Entry::EntityType).not_null())
                    .col(string_uniq(Entry::Title).not_null())
                    .col(string(Entry::Text))
                    .foreign_key(
                        ForeignKey::create()
                            .name(ENTRY_FOLDER_ID_FK_NAME)
                            .from(Entry::Table, Entry::FolderId)
                            .to(Folder::Table, Folder::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // The title of the entry has to be unique across the DB, irrespective of location.
        // Querying is done on the basis of the entry title, and unique titles make the
        // implementation simpler and the user experience less cumbersome.
        manager
            .create_index(
                Index::create()
                    .name(ENTRY_TITLE_INDEX_NAME)
                    .table(Entry::Table)
                    .col(Entry::Title)
                    .to_owned(),
            )
            .await?;

        // Speeds up querying by folder ID when building the subtree CTE.
        manager
            .create_index(
                Index::create()
                    .name(ENTRY_FOLDER_ID_INDEX_NAME)
                    .table(Entry::Table)
                    .col(Entry::FolderId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(Index::drop().name(ENTRY_TITLE_INDEX_NAME).to_owned())
            .await?;
        manager
            .drop_index(Index::drop().name(ENTRY_FOLDER_ID_INDEX_NAME).to_owned())
            .await?;
        manager
            .drop_foreign_key(ForeignKey::drop().name(ENTRY_FOLDER_ID_FK_NAME).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Entry::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
pub enum Entry {
    Table,
    Id,
    FolderId,
    #[sea_orm(rs_type = "u8")]
    EntityType,
    Title,
    Text,
}

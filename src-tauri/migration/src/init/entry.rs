use sea_orm_migration::{prelude::*, schema::*};

use crate::init::folder::ROOT_FOLDER_ID;

const ENTRY_TITLE_INDEX_NAME: &str = "index_entry_title";

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
                    .col(integer(Entry::FolderId).default(ROOT_FOLDER_ID))
                    .col(tiny_unsigned(Entry::EntityType).not_null())
                    .col(string_uniq(Entry::Title).not_null())
                    .col(string(Entry::Text))
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name(ENTRY_TITLE_INDEX_NAME)
                    .table(Entry::Table)
                    .col(Entry::Title)
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

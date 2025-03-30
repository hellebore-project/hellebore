use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

pub const ROOT_FOLDER_ID: i32 = -1;
const FOLDER_PARENT_ID_NAME_INDEX_NAME: &str = "index_folder_parent_id_name";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Folder::Table)
                    .if_not_exists()
                    .col(pk_auto(Folder::Id).not_null())
                    .col(integer(Folder::ParentId).default(ROOT_FOLDER_ID))
                    .col(string(Folder::Name).not_null())
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name(FOLDER_PARENT_ID_NAME_INDEX_NAME)
                    .table(Folder::Table)
                    .col(Folder::ParentId)
                    .col(Folder::Name)
                    .unique()
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(
                Index::drop()
                    .name(FOLDER_PARENT_ID_NAME_INDEX_NAME)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(Folder::Table).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
pub enum Folder {
    Table,
    Id,
    ParentId,
    Name,
}

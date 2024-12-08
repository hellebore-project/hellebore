use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

const FOLDER_PARENT_ID_CONSTRAINT_NAME: &str = "fk_folder_parent_id";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Folder::Table)
                    .if_not_exists()
                    .col(pk_auto(Folder::Id).not_null())
                    .col(integer_null(Folder::ParentId))
                    .col(string(Folder::Name).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name(FOLDER_PARENT_ID_CONSTRAINT_NAME)
                            .from(Folder::Table, Folder::ParentId)
                            .to(Folder::Table, Folder::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name(FOLDER_PARENT_ID_CONSTRAINT_NAME)
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

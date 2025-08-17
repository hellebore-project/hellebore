use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

pub const ROOT_FOLDER_ID: i32 = -1;
const FOLDER_PARENT_ID_NAME_INDEX_NAME: &str = "index_folder_parent_id_name";
const FOLDER_PARENT_ID_FK_NAME: &str = "fk_folder_parent_id";

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
                    .col(string(Folder::ParentIdNotNull).generated(
                        Func::coalesce([
                            Expr::col(Folder::ParentId).into(),
                            Expr::val(ROOT_FOLDER_ID).into(),
                        ]),
                        false,
                    ))
                    .col(string(Folder::Name).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name(FOLDER_PARENT_ID_FK_NAME)
                            .from(Folder::Table, Folder::ParentId)
                            .to(Folder::Table, Folder::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;
        // Nullable columns don't play nicely with composite indices; sqlite doesn't treat null as a unique value.
        // To get around that, we introduce a generated column that coalesces null parent IDs into a sentinel value
        manager
            .create_index(
                Index::create()
                    .name(FOLDER_PARENT_ID_NAME_INDEX_NAME)
                    .table(Folder::Table)
                    .col(Folder::ParentIdNotNull)
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
            .drop_foreign_key(ForeignKey::drop().name(FOLDER_PARENT_ID_FK_NAME).to_owned())
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
    ParentIdNotNull,
    Name,
}

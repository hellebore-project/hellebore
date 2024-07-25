use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

const LANGUAGE_NAME_INDEX_NAME: &str = "language_name_index";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Language::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Language::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Language::Name).string().unique_key().not_null())
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name(LANGUAGE_NAME_INDEX_NAME)
                    .table(Language::Table)
                    .col(Language::Name)
                    .to_owned()
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Language::Table).to_owned())
            .await?;
        manager
            .drop_index(Index::drop().name(LANGUAGE_NAME_INDEX_NAME).to_owned())
            .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Language {
    Table,
    Id,
    Name,
}

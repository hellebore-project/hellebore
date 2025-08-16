use sea_orm_migration::{prelude::*, schema::*};

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
                    // TODO: add auto-increment to primary key
                    .col(integer(Person::Id).primary_key().unique_key().not_null())
                    .col(string(Person::Name).not_null())
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
    Name,
}
